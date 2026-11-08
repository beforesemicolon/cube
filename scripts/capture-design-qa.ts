import { chromium, type Browser, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { componentEntries } from './component-entries.js'

interface CaptureResult {
    readonly category: string
    readonly component: string
    readonly storyId: string
    readonly rendered: boolean
    readonly width: number
    readonly height: number
    readonly consoleErrors: readonly string[]
    readonly lightScreenshot: string
    readonly darkScreenshot: string
}

interface RenderBounds {
    readonly width: number
    readonly height: number
}

interface AuditableOverlayElement extends HTMLElement {
    show?: () => boolean | void
    showAt?: (x: number, y: number) => void
}

const storyOverrides: Readonly<Record<string, string>> = {
    'audio-player': 'media--audio',
    'video-player': 'media--video',
    'cartesian-chart': 'charts--line',
    'pie-chart': 'charts--pie',
}

const outputRoot = resolve('design-qa-artifacts')
const implementationRoot = resolve(outputRoot, 'implementation')

async function openForAudit(
    element: ReturnType<Page['locator']>,
    component: string
): Promise<void> {
    if (
        ![
            'context-menu',
            'command-palette',
            'modal',
            'alert-dialog',
            'drawer',
            'bottom-sheet',
        ].includes(component)
    )
        return
    await element.evaluate(
        async (host: AuditableOverlayElement, componentName: string) => {
            await customElements.whenDefined(host.localName)
            if (componentName === 'context-menu') host.showAt?.(48, 48)
            else host.show?.()
            await new Promise<void>((resolveFrame) =>
                requestAnimationFrame(() => resolveFrame())
            )
        },
        component
    )
}

async function captureAppearance(
    page: Page,
    storyId: string,
    component: string,
    appearance: 'light' | 'dark',
    target: string
): Promise<{ rendered: boolean; width: number; height: number }> {
    await page.goto(
        `http://127.0.0.1:6006/iframe.html?id=${storyId}&viewMode=story&globals=appearance:${appearance}`,
        { waitUntil: 'domcontentloaded' }
    )
    const selector = `cb-${component}`
    const element = page.locator(selector).first()
    let attached = true
    try {
        await element.waitFor({ state: 'attached', timeout: 2_000 })
    } catch {
        attached = false
    }
    if (attached) await openForAudit(element, component)
    const box = attached
        ? await element.evaluate((host: Element): RenderBounds | null => {
              const direct = host.getBoundingClientRect()
              if (direct.width > 0 && direct.height > 0)
                  return { width: direct.width, height: direct.height }
              const root = host.shadowRoot
              if (!root) return null
              const visible = [
                  ...host.querySelectorAll<HTMLElement>('*'),
                  ...root.querySelectorAll<HTMLElement>('*'),
              ]
                  .map((node) => node.getBoundingClientRect())
                  .filter((rect) => rect.width > 0 && rect.height > 0)
              if (!visible.length) return null
              const left = Math.min(...visible.map((rect) => rect.left))
              const right = Math.max(...visible.map((rect) => rect.right))
              const top = Math.min(...visible.map((rect) => rect.top))
              const bottom = Math.max(...visible.map((rect) => rect.bottom))
              return { width: right - left, height: bottom - top }
          })
        : null
    // Native dialogs and other top-layer UI paint outside the Storybook root's
    // element snapshot even though they are visible in the page viewport.
    await page.screenshot({ path: target })
    return {
        rendered: box !== null && box.width > 0 && box.height > 0,
        width: box?.width ?? 0,
        height: box?.height ?? 0,
    }
}

async function capture(browser: Browser): Promise<readonly CaptureResult[]> {
    const page = await browser.newPage({
        viewport: { width: 1100, height: 760 },
        deviceScaleFactor: 1,
    })
    const errors: string[] = []
    page.on('console', (message) => {
        if (
            message.type() === 'error' &&
            !message.location().url.endsWith('/favicon.ico')
        )
            errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))
    const results: CaptureResult[] = []
    for (const entry of componentEntries) {
        const [category] = entry.path.split('/')
        if (!category)
            throw new Error(`Component path has no category: ${entry.path}`)
        const storyId =
            storyOverrides[entry.name] ?? `${category}--${entry.name}`
        const componentDirectory = resolve(implementationRoot, category)
        await mkdir(componentDirectory, { recursive: true })
        const lightScreenshot = resolve(
            componentDirectory,
            `${entry.name}-light.png`
        )
        const darkScreenshot = resolve(
            componentDirectory,
            `${entry.name}-dark.png`
        )
        const errorStart = errors.length
        const light = await captureAppearance(
            page,
            storyId,
            entry.name,
            'light',
            lightScreenshot
        )
        await captureAppearance(
            page,
            storyId,
            entry.name,
            'dark',
            darkScreenshot
        )
        results.push({
            category,
            component: entry.name,
            storyId,
            rendered: light.rendered,
            width: light.width,
            height: light.height,
            consoleErrors: errors.slice(errorStart),
            lightScreenshot,
            darkScreenshot,
        })
        process.stdout.write(
            `${results.length}/${componentEntries.length} ${entry.path}\n`
        )
    }
    await page.close()
    return results
}

await mkdir(implementationRoot, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
    const results = await capture(browser)
    await writeFile(
        resolve(outputRoot, 'results.json'),
        JSON.stringify(results, null, 2) + '\n'
    )
    const failures = results.filter(
        (result) => !result.rendered || result.consoleErrors.length > 0
    )
    console.log(
        `Captured ${results.length} component stories; ${failures.length} have render or console failures.`
    )
} finally {
    await browser.close()
}
