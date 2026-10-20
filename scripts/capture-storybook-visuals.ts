import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface StoryEntry { id: string; type: string; title: string; name: string }
interface StoryIndex { entries: Record<string, StoryEntry> }
interface Capture { id: string; appearance: string; path: string; errors: string[] }
interface ComponentErrorDetail { code?: string; component?: string; error?: Error }
interface AuditableHost extends HTMLElement {
    open?: boolean
    expanded?: boolean
    show?: () => void
    showAt?: (x: number, y: number) => void
}
const interactive: Readonly<Record<string, string>> = {
    'action--split-button': 'cb-split-button',
    'form--combobox': 'cb-combobox', 'form--select': 'cb-select',
    'form--date-picker': 'cb-date-picker', 'form--time-picker': 'cb-time-picker',
    'overlay--popover': 'cb-popover', 'overlay--hover-card': 'cb-hover-card',
    'overlay--drawer': 'cb-drawer', 'overlay--bottom-sheet': 'cb-bottom-sheet',
    'overlay--context-menu': 'cb-context-menu', 'overlay--dropdown': 'cb-dropdown',
    'overlay--command-palette': 'cb-command-palette', 'overlay--tooltip': 'cb-tooltip',
    'overlay--modal': 'cb-modal', 'overlay--alert-dialog': 'cb-alert-dialog',
    'styling--color-picker': 'cb-color-picker',
    'data-display--expandable-section': 'cb-expandable-section',
    'layout--sidebar': 'cb-sidebar',
}

const root = resolve(process.env.OUTPUT_ROOT ?? 'design-qa-artifacts/stories')
const origin = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006'
const filter = process.env.STORY_FILTER ?? ''
const appearances = process.env.CAPTURE_APPEARANCE ? [process.env.CAPTURE_APPEARANCE] : ['light', 'dark']
const index: StoryIndex = await (await fetch(`${origin}/index.json`)).json()
const stories = Object.values(index.entries).filter(entry => entry.type === 'story' && entry.id.includes(filter))
await mkdir(root, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const results: Capture[] = []
try {
    for (const appearance of appearances) {
        const page = await browser.newPage({ viewport: { width: 1100, height: 800 }, reducedMotion: 'reduce' })
        let errors: string[] = []
        let activeStory = ''
        page.on('pageerror', error => errors.push(error.message))
        await page.exposeFunction('reportCubeRenderError', (component: string, message: string) => {
            if (activeStory === 'media--invalid-source') return
            errors.push(`${component}: ${message}`)
        })
        await page.addInitScript(() => {
            const reporter = window as Window & { reportCubeRenderError(component: string, message: string): Promise<void> }
            document.addEventListener('error', event => {
                if (!(event instanceof CustomEvent)) return
                const detail = (event as CustomEvent<ComponentErrorDetail>).detail
                if (detail?.code === 'COMPONENT_ERROR') void reporter.reportCubeRenderError(detail.component ?? 'component', detail.error?.message ?? 'Component rendering failed')
            }, true)
        })
        for (const story of stories) {
            errors = []
            activeStory = story.id
            await page.goto(`${origin}/iframe.html?id=${story.id}&viewMode=story&globals=appearance:${appearance}`)
            await page.locator(`cube-story-events[data-story-id="${story.id}"]`).waitFor({ state: 'attached' })
            await page.waitForFunction(() => Boolean(document.querySelector('cube-story-events')?.firstElementChild))
            await page.waitForTimeout(250)
            const path = resolve(root, `${story.id}-${appearance}.png`)
            const bounds = await page.locator('#storybook-root').boundingBox()
            const height = Math.max(120, Math.min(800, Math.ceil((bounds?.y ?? 0) + (bounds?.height ?? 800) + 16)))
            if ((bounds?.height ?? 0) > 800) await page.screenshot({ path, fullPage: true, animations: 'disabled' })
            else await page.screenshot({ path, clip: { x: 0, y: 0, width: 1100, height }, animations: 'disabled' })
            results.push({ id: story.id, appearance, path, errors })
            const selector = interactive[story.id]
            if (selector) {
                await page.locator(selector).first().evaluate((host: AuditableHost) => {
                    if (host.localName === 'cb-sidebar') host.expanded = false
                    else if (host.localName === 'cb-expandable-section') host.expanded = true
                    else if (host.showAt) host.showAt(80, 80)
                    else if (host.show) host.show()
                    else host.open = true
                })
                await page.waitForTimeout(150)
                const statePath = resolve(root, `${story.id}-${appearance}-interactive.png`)
                await page.screenshot({ path: statePath, animations: 'disabled' })
                results.push({ id: `${story.id} (interactive)`, appearance, path: statePath, errors })
            }
            process.stdout.write(`${appearance} ${story.id}${errors.length ? ` ERRORS: ${errors.join('; ')}` : ''}\n`)
        }
        // Contact sheets preserve a readable overview; full-resolution captures remain alongside them.
        const captures = results.filter(result => result.appearance === appearance)
        for (let offset = 0; offset < captures.length; offset += 12) {
            const cards = await Promise.all(captures.slice(offset, offset + 12).map(async capture =>
                `<article><h2>${capture.id}</h2><img src="data:image/png;base64,${(await readFile(capture.path)).toString('base64')}"></article>`))
            await page.setContent(`<style>body{margin:0;background:#888;display:grid;grid-template-columns:repeat(3,550px);gap:4px}article{margin:0;background:${appearance === 'light' ? '#fff' : '#171b22'};height:350px;overflow:hidden}h2{font:16px system-ui;margin:0;padding:6px;background:#eee;color:#111}img{width:550px;height:318px;object-fit:contain;object-position:top left}</style>${cards.join('')}`)
            await page.screenshot({ path: resolve(root, `sheet-${appearance}-${String(offset / 12 + 1).padStart(2, '0')}.png`), fullPage: true, animations: 'disabled' })
        }
        await page.close()
    }
    await writeFile(resolve(root, 'results.json'), JSON.stringify(results, null, 2))
    if (results.some(result => result.errors.length > 0)) process.exitCode = 1
} finally {
    await browser.close()
}
