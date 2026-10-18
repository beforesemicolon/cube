import { chromium, type Browser, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { componentEntries } from './component-entries.js'

interface BoardConfig {
    readonly file: string
    readonly width: number
    readonly height: number
    readonly components: readonly string[]
}

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
    readonly comparison?: string
}

interface RenderBounds {
    readonly width: number
    readonly height: number
}

const boards: Readonly<Record<string, BoardConfig>> = {
    actions: {
        file: '01/Actions.png', width: 3376, height: 5304,
        components: ['button','icon-button','split-button','toggle-button','button-group','segmented-control','tabs','breadcrumb','menu','context-menu','dropdown','command-palette','toolbar','action-bar','link','pagination','tooltip','shortcut'],
    },
    inputs: {
        file: '02/Inputs.png', width: 3376, height: 8106,
        components: ['text-input','textarea','number-input','unit-input','search','combobox','autocomplete','select','multi-select','checkbox','radio','switch','slider','range-slider','stepper','date-picker','time-picker','file-picker','token-input','editable-label','masked-input'],
    },
    styling: {
        file: '03/Color & style.png', width: 3376, height: 13920,
        components: ['color-picker','color-swatch','eyedropper','hue','alpha','gradient-editor','gradient-stops','fill','stroke','shadow','opacity','blend-mode','radius','spacing','typography','font-family','font-weight','decoration','alignment','css-variable','design-token','image-background','filter'],
    },
    layout: {
        file: '04/Layout.png', width: 3376, height: 11228,
        components: ['width-height','min-max','aspect-ratio','box-model','margin-padding','flex-direction','flex-alignment','gap','grid-editor','grid-track','position','anchor','overflow','breakpoints','layout-visibility','transform','rotation','z-index','sizing-mode'],
    },
    data: {
        file: '05/Data & feedback.png', width: 3376, height: 7728,
        components: ['badge','status','avatar','card','list','description-row','property-row','table','tree','accordion','divider','empty-state','skeleton','progress','spinner','toast','alert','validation','banner','stat','code-preview','activity-log'],
    },
    overlays: {
        file: '06/Overlays.png', width: 3376, height: 6300,
        components: ['popover','modal','alert-dialog','drawer','floating-panel','inspector','floating-toolbar','nested-menu','hover-card','bottom-sheet','collapsible-sidebar','resizable-panel','docked-panel','panel-tabs','panel-header'],
    },
    canvas: {
        file: '07/Canvas.png', width: 3376, height: 11352,
        components: ['viewport','artboard','selection-box','resize-handle','rotation-handle','multi-selection','hover-outline','smart-guides','snap-lines','rulers','grid-overlay','spacing-measure','alignment-guide','drop-indicator','drag-preview','zoom','pan','cursor','inline-text','marquee','insertion','canvas-menu','component-outline','lock-overlay','hidden-indicator','device-frame'],
    },
    assets: {
        file: '08/Assets & structure.png', width: 3376, height: 9130,
        components: ['layer-tree','layer-row','layer-visibility','lock','reorder','component-browser','component-preview','instance-indicator','asset-manager','image-browser','media-preview','font-browser','icon-browser','page-navigator','page-thumbnail','symbol-library','variants','breakpoint-navigator','history','undo-redo','properties-inspector','property-group'],
    },
    advanced: {
        file: '09/Advanced editors.png', width: 3376, height: 8082,
        components: ['multi-value','linked-dimension','unit-conversion','expression','variable-binding','responsive-override','state-selector','pseudo-state','transition','easing','bezier','timeline','keyframe','trigger','conditional-visibility','data-binding','action-editor','constraints'],
    },
    shell: {
        file: '10/App shell.png', width: 3376, height: 8408,
        components: ['top-bar','workspace-switcher','project-picker','save-status','publish-status','preview-switch','design-code','device-selector','inspector-sidebar','asset-sidebar','status-bar','selection-trail','undo-redo','shortcuts','preferences','theme-switch','user-menu','version-history','share-dialog','publish-dialog'],
    },
    collaboration: {
        file: '11/Collaboration & AI.png', width: 3376, height: 6387,
        components: ['presence','remote-cursor','comment-pin','comment-thread','annotation','review-status','suggested-change','ai-command','ai-action-menu','ai-selection-toolbar','diff-preview','accept-reject','generation','conflict','approval'],
    },
}

const storyOverrides: Readonly<Record<string, string>> = {
    'audio-player': 'media--audio',
    'video-player': 'media--video',
    'cartesian-chart': 'charts--line',
    'pie-chart': 'charts--pie',
}

const designRoot = resolve('design/figma-layers/Studio')
const outputRoot = resolve('design-qa-artifacts')
const implementationRoot = resolve(outputRoot, 'implementation')
const referenceRoot = resolve(outputRoot, 'reference')
const comparisonRoot = resolve(outputRoot, 'comparison')

function boardFor(component: string): { config: BoardConfig; index: number } | undefined {
    for (const config of Object.values(boards)) {
        const index = config.components.indexOf(component)
        if (index >= 0) return { config, index }
    }
    return undefined
}

function createReferenceCrop(component: string): string | undefined {
    const board = boardFor(component)
    if (!board) return undefined
    const columns = 3
    const rows = Math.ceil(board.config.components.length / columns)
    const column = board.index % columns
    const row = Math.floor(board.index / columns)
    const x = Math.round(column * board.config.width / columns)
    const nextX = Math.round((column + 1) * board.config.width / columns)
    const y = Math.round(row * board.config.height / rows)
    const nextY = Math.round((row + 1) * board.config.height / rows)
    const target = resolve(referenceRoot, `${component}.png`)
    execFileSync('magick', [resolve(designRoot, board.config.file), '-crop', `${nextX - x}x${nextY - y}+${x}+${y}`, '+repage', target])
    return target
}

async function captureAppearance(page: Page, storyId: string, component: string, appearance: 'light' | 'dark', target: string): Promise<{ rendered: boolean; width: number; height: number }> {
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=${storyId}&viewMode=story&globals=appearance:${appearance}`, { waitUntil: 'domcontentloaded' })
    const selector = `cb-${component}`
    const element = page.locator(selector).first()
    let attached = true
    try { await element.waitFor({ state: 'attached', timeout: 2_000 }) } catch { attached = false }
    const box = attached ? await element.evaluate<RenderBounds | null>((host: Element) => {
        const direct = host.getBoundingClientRect()
        if (direct.width > 0 && direct.height > 0) return { width: direct.width, height: direct.height }
        const root = host.shadowRoot
        if (!root) return null
        const visible = [...host.querySelectorAll<HTMLElement>('*'), ...root.querySelectorAll<HTMLElement>('*')]
            .map(node => node.getBoundingClientRect())
            .filter(rect => rect.width > 0 && rect.height > 0)
        if (!visible.length) return null
        const left = Math.min(...visible.map(rect => rect.left))
        const right = Math.max(...visible.map(rect => rect.right))
        const top = Math.min(...visible.map(rect => rect.top))
        const bottom = Math.max(...visible.map(rect => rect.bottom))
        return { width: right - left, height: bottom - top }
    }) : null
    // Native dialogs and other top-layer UI paint outside the Storybook root's
    // element snapshot even though they are visible in the page viewport.
    await page.screenshot({ path: target })
    return { rendered: box !== null && box.width > 0 && box.height > 0, width: box?.width ?? 0, height: box?.height ?? 0 }
}

async function capture(browser: Browser): Promise<readonly CaptureResult[]> {
    const page = await browser.newPage({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 1 })
    const errors: string[] = []
    page.on('console', message => {
        if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(message.text())
    })
    page.on('pageerror', error => errors.push(error.message))
    const results: CaptureResult[] = []
    for (const entry of componentEntries) {
        const [category] = entry.path.split('/')
        if (!category) throw new Error(`Component path has no category: ${entry.path}`)
        const storyId = storyOverrides[entry.name] ?? `${category}--${entry.name}`
        const componentDirectory = resolve(implementationRoot, category)
        await mkdir(componentDirectory, { recursive: true })
        const lightScreenshot = resolve(componentDirectory, `${entry.name}-light.png`)
        const darkScreenshot = resolve(componentDirectory, `${entry.name}-dark.png`)
        const errorStart = errors.length
        const light = await captureAppearance(page, storyId, entry.name, 'light', lightScreenshot)
        await captureAppearance(page, storyId, entry.name, 'dark', darkScreenshot)
        const reference = createReferenceCrop(entry.name)
        let comparison: string | undefined
        if (reference) {
            comparison = resolve(comparisonRoot, `${entry.name}.png`)
            execFileSync('magick', [
                '(', reference, '-resize', '900x440', '-gravity', 'north', '-background', 'white', '-extent', '900x440', ')',
                '(', lightScreenshot, '-resize', '900x440', '-gravity', 'center', '-background', 'white', '-extent', '900x440', ')',
                '(', darkScreenshot, '-resize', '900x440', '-gravity', 'center', '-background', '#141719', '-extent', '900x440', ')',
                '-append', comparison,
            ])
        }
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
            comparison,
        })
        process.stdout.write(`${results.length}/${componentEntries.length} ${entry.path}\n`)
    }
    await page.close()
    return results
}

await mkdir(implementationRoot, { recursive: true })
await mkdir(referenceRoot, { recursive: true })
await mkdir(comparisonRoot, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
    const results = await capture(browser)
    await writeFile(resolve(outputRoot, 'results.json'), JSON.stringify(results, null, 2) + '\n')
    const failures = results.filter(result => !result.rendered || result.consoleErrors.length > 0)
    console.log(`Captured ${results.length} component stories; ${failures.length} have render or console failures.`)
} finally {
    await browser.close()
}
