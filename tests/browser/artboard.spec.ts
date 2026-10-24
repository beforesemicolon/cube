import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Artboard, ArtboardProps, ArtboardResizeDetail, ArtboardRenameDetail } from '../../components/editor/artboard/index.js'
import type { Viewport } from '../../components/editor/viewport/index.js'

declare global {
    interface Window {
        artboardRenames: ArtboardRenameDetail[]
        artboardResizes: ArtboardResizeDetail[]
        artboardSelections: number
        viewportChanges: number
    }
}

async function mount(page: Page, props: ArtboardProps = {}): Promise<void> {
    await page.evaluate(props => {
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, {
            name: 'Homepage', nameLabel: 'Artboard name', namePlaceholder: 'Untitled artboard',
            saveLabel: 'Save name', cancelLabel: 'Cancel rename', dimensionsLabel: '{width} × {height}',
            resizeLabel: '{handle}', handleLabels: { e: 'Resize right', s: 'Resize bottom', se: 'Resize corner' },
            ...props,
        })
        const content = document.createElement('div')
        content.setAttribute('data-content', '')
        content.style.cssText = 'width:320px;height:150px;background:var(--color-surface-muted)'
        content.textContent = 'Document content'
        board.append(content)
        window.artboardRenames = []
        window.artboardResizes = []
        window.artboardSelections = 0
        board.addEventListener('change', event => {
            if (event.composedPath()[0] === board) {
                const detail = (event as CustomEvent<ArtboardRenameDetail>).detail
                window.artboardRenames.push({ value: detail.value, previousValue: detail.previousValue })
            }
        })
        board.addEventListener('resize', event => {
            if (!(event instanceof CustomEvent)) return
            const detail = (event as CustomEvent<ArtboardResizeDetail>).detail
            window.artboardResizes.push({ value: detail.value, previousValue: detail.previousValue })
        })
        board.addEventListener('select', () => { window.artboardSelections++ })
        document.querySelector('#fixture')!.append(board)
    }, props)
    await expect(page.locator('cb-artboard [part~=frame]')).toHaveCSS('width', `${props.width || 322}px`)
}

const errors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
    const failures: string[] = []
    errors.set(page, failures)
    page.on('pageerror', error => failures.push(error.message))
    page.on('console', message => {
        if (message.type() === 'error' && /TypeError|ReferenceError|RangeError/.test(message.text())) failures.push(message.text())
    })
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-artboard')))
})
test.afterEach(async ({ page }) => { expect(errors.get(page)).toEqual([]) })

test('auto-size follows full content extent, growth, shrinkage, and empty content without scrolling', async ({ page }) => {
    await mount(page)
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    await expect(frame).toHaveCSS('height', '152px')
    await board.locator('[data-content]').evaluate(node => {
        const child = document.createElement('div')
        child.style.cssText = 'width:580px;height:280px'
        node.replaceChildren(child)
        node.style.width = '120px'; node.style.height = '80px'
    })
    await expect(frame).toHaveCSS('width', '582px')
    await expect(frame).toHaveCSS('height', '282px')
    await board.locator('[data-content]').evaluate(node => {
        node.replaceChildren(); node.style.width = '200px'; node.style.height = '90px'
    })
    await expect(frame).toHaveCSS('width', '202px')
    await expect(frame).toHaveCSS('height', '92px')
    await expect(board.locator('[part~=content-viewport]')).toHaveCSS('overflow', 'clip')
    expect(await board.locator('[part~=content-viewport]').evaluate(node => {
        node.scrollTop = 50; node.scrollLeft = 50
        return [node.scrollTop, node.scrollLeft]
    })).toEqual([0, 0])
    await board.locator('[data-content]').evaluate(node => node.remove())
    await expect(frame).toHaveCSS('width', '2px')
    await expect(frame).toHaveCSS('height', '2px')
})

test('explicit dimensions clip without scrollbars and clearing them restores auto-size', async ({ page }) => {
    await mount(page, { width: 220, height: 100 })
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    await expect(frame).toHaveCSS('height', '100px')
    await board.locator('[data-content]').evaluate(node => { node.style.width = '640px'; node.style.height = '360px' })
    await expect(frame).toHaveCSS('width', '220px')
    await expect(frame).toHaveCSS('height', '100px')
    await board.evaluate(node => { const board = node as Artboard; board.width = undefined; board.height = undefined })
    await expect(frame).toHaveCSS('width', '642px')
    await expect(frame).toHaveCSS('height', '362px')
})

test('name edits emit one confirmed change; cancel and a veto preserve the original name', async ({ page }) => {
    await mount(page)
    const board = page.locator('cb-artboard')
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick()
    await board.getByRole('textbox', { name: 'Artboard name', exact: true }).fill('Landing page')
    expect(await page.evaluate(() => window.artboardRenames)).toEqual([])
    await board.getByRole('button', { name: 'Save name', exact: true }).click()
    await expect(board).toHaveJSProperty('name', 'Landing page')
    expect(await page.evaluate(() => window.artboardRenames)).toEqual([{ value: 'Landing page', previousValue: 'Homepage' }])
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick()
    await board.getByRole('textbox').fill('Discarded')
    await board.getByRole('button', { name: 'Cancel rename', exact: true }).click()
    await expect(board).toHaveJSProperty('name', 'Landing page')
    await board.evaluate(node => node.addEventListener('beforechange', event => event.preventDefault(), { once: true }))
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick()
    await board.getByRole('textbox').fill('Vetoed')
    await board.getByRole('textbox').press('Enter')
    await expect(board.getByRole('textbox')).toBeVisible()
    await expect(board).toHaveJSProperty('name', 'Landing page')
    await board.getByRole('textbox').press('Escape')
    expect(await page.evaluate(() => window.artboardRenames)).toHaveLength(1)
})

test('resize handles match the selection line, reveal only at its edges, and stay usable while dragging', async ({ page }) => {
    await mount(page, { selected: true })
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    const handles = board.locator('[part~=resize-handle]')
    await board.locator('[data-content]').hover()
    for (const handle of await handles.all()) await expect(handle).toHaveCSS('opacity', '0')
    for (const edge of ['n', 'e', 's', 'w']) {
        const edgeBounds = (await board.locator(`[part~=selection-edge-${edge}]`).boundingBox())!
        await page.mouse.move(edgeBounds.x + edgeBounds.width / 4, edgeBounds.y + edgeBounds.height / 4)
        for (const handle of await handles.all()) await expect(handle).toHaveCSS('opacity', '1')
    }
    const color = await frame.evaluate(node => getComputedStyle(node).borderRightColor)
    const lineWidth = await frame.evaluate(node => Number.parseFloat(getComputedStyle(node).getPropertyValue('--artboard-selection-line-width')))
    const corner = board.getByRole('button', { name: 'Resize corner', exact: true })
    await expect(corner).toHaveCSS('background-color', color)
    const bounds = (await corner.boundingBox())!
    expect(bounds.width).toBe(lineWidth + 2)
    expect(bounds.height).toBe(lineWidth + 2)
    await page.screenshot({ path: 'test-results/artboard-border-handles.png' })
    await corner.hover(); await page.mouse.down()
    await page.mouse.move(bounds.x + 32, bounds.y + 22)
    await expect(corner).toHaveCSS('opacity', '1')
    await page.mouse.up()
    expect(await page.evaluate(() => window.artboardResizes.length)).toBeGreaterThan(0)
    await page.mouse.move(0, 0)
    for (const handle of await handles.all()) await expect(handle).toHaveCSS('opacity', '0')
    await corner.focus()
    await expect(corner).toHaveCSS('opacity', '1')
    await board.evaluate(node => { (node as Artboard).selected = false })
    await expect(board.locator('[part~=selection-edge]:visible')).toHaveCount(0)
})

test('selection and keyboard handles respect flags, constraints, vetoes, and single events', async ({ page }) => {
    await mount(page, { minWidth: 300, minHeight: 140, resizeStep: 10 })
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    await expect(board.locator('[part~=resize-handle]:visible')).toHaveCount(0)
    await frame.focus(); await frame.press('Enter')
    await expect(board.locator('[part~=resize-handle]:visible')).toHaveCount(3)
    const corner = board.getByRole('button', { name: 'Resize corner', exact: true })
    await corner.press('ArrowRight')
    await expect(board).toHaveJSProperty('width', 332)
    await expect(board).toHaveJSProperty('height', 152)
    await corner.press('Shift+ArrowLeft')
    await expect(board).toHaveJSProperty('width', 300)
    await corner.press('Shift+ArrowUp')
    await expect(board).toHaveJSProperty('height', 140)
    expect(await page.evaluate(() => window.artboardSelections)).toBe(1)
    expect(await page.evaluate(() => window.artboardResizes[0])).toEqual({ value: { width: 332, height: 152 }, previousValue: { width: 322, height: 152 } })
    await board.evaluate(node => node.addEventListener('beforeresize', event => event.preventDefault(), { once: true }))
    await corner.press('ArrowRight')
    await expect(board).toHaveJSProperty('width', 300)
    await board.evaluate(node => { (node as Artboard).resizable = false })
    await expect(board.locator('[part~=resize-handle]:visible')).toHaveCount(0)
    expect(await page.evaluate(() => window.artboardResizes)).toHaveLength(3)
    await board.evaluate(node => { const board = node as Artboard; board.disabled = true; board.resizable = true })
    await expect(board.locator('[part~=resize-handle]:visible')).toHaveCount(0)
})

async function inViewport(page: Page, zoom: number): Promise<void> {
    await mount(page, { selected: true })
    await page.evaluate(zoom => {
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { accessibleLabel: 'Canvas', zoom, x: 70, y: -25, zoomInLabel: 'Zoom in', zoomOutLabel: 'Zoom out', resetLabel: 'Reset view' })
        const spacer = document.createElement('span')
        spacer.style.cssText = 'display:inline-block;width:120px;height:40px'
        const board = document.querySelector('cb-artboard')!
        viewport.append(spacer, board)
        document.querySelector('#fixture')!.append(viewport)
        window.viewportChanges = 0
        viewport.addEventListener('change', event => { if (event.composedPath()[0] === viewport) window.viewportChanges++ })
    }, zoom)
}

test('pointer resizing uses unscaled CSS pixels and persists its explicit size', async ({ page }) => {
    await inViewport(page, 200)
    await page.locator('cb-viewport').evaluate(node => { const viewport = node as Viewport; viewport.x = 0; viewport.y = 0 })
    const board = page.locator('cb-artboard'), handle = board.getByRole('button', { name: 'Resize corner', exact: true })
    const box = await handle.boundingBox()
    expect(box).not.toBeNull()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down(); await page.mouse.move(box!.x + box!.width / 2 + 40, box!.y + box!.height / 2 + 20); await page.mouse.up()
    await expect.poll(() => board.evaluate(node => Math.round((node as Artboard).width ?? 0))).toBe(342)
    await expect.poll(() => board.evaluate(node => Math.round((node as Artboard).height ?? 0))).toBe(162)
    await board.locator('[data-content]').evaluate(node => { node.style.width = '700px'; node.style.height = '500px' })
    await expect(board.locator('[part~=frame]')).toHaveCSS('width', '342px')
    await expect(board.locator('[part~=frame]')).toHaveCSS('height', '162px')
})

for (const target of ['surface', 'name'] as const) {
    test(`${target === 'name' ? 'single' : 'double'}-clicking the ${target} centers the artboard at actual size, independent of zoom and pan`, async ({ page }) => {
        await inViewport(page, 50)
        const board = page.locator('cb-artboard'), viewport = page.locator('cb-viewport')
        await board.evaluate(node => { (node as Artboard).selected = false })
        if (target === 'name') await board.getByRole('button', { name: /^Artboard name/ }).click()
        else await board.locator('[data-content]').dblclick()
        await expect(viewport).toHaveJSProperty('zoom', 100)
        await expect(board).toHaveJSProperty('selected', true)
        await expect(board.getByRole('textbox')).toHaveCount(0)
        const bounds = await board.locator('[part~=frame]').boundingBox(), surface = await viewport.locator('[part~=viewport]').boundingBox()
        expect(bounds!.width).toBeCloseTo(322, 0)
        expect(bounds!.x + bounds!.width / 2).toBeCloseTo(surface!.x + surface!.width / 2, 0)
        expect(bounds!.y + bounds!.height / 2).toBeCloseTo(surface!.y + surface!.height / 2, 0)
        expect(await page.evaluate(() => window.viewportChanges)).toBe(1)
    })
}

test('double-clicking the name edits without centering and F2 remains available', async ({ page }) => {
    await inViewport(page, 50)
    await page.clock.install()
    const board = page.locator('cb-artboard'), viewport = page.locator('cb-viewport')
    await board.evaluate(node => { (node as Artboard).selected = false })
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick({ delay: 80 })
    await expect(board.getByRole('textbox')).toHaveValue('Homepage')
    await expect(board).toHaveJSProperty('selected', true)
    await page.clock.runFor(350)
    await expect(viewport).toHaveJSProperty('zoom', 50)
    expect(await page.evaluate(() => window.viewportChanges)).toBe(0)
    await board.getByRole('textbox').fill('Discarded')
    await board.getByRole('textbox').press('Escape')
    await board.getByRole('button', { name: /^Artboard name/ }).press('F2')
    await expect(board.getByRole('textbox')).toHaveValue('Homepage')
    await board.getByRole('textbox').fill('Renamed')
    await board.getByRole('textbox').press('Enter')
    expect(await page.evaluate(() => window.artboardRenames)).toEqual([{ value: 'Renamed', previousValue: 'Homepage' }])
})

test('disconnecting cancels a pending name-click center', async ({ page }) => {
    await inViewport(page, 50)
    await page.clock.install()
    const board = page.locator('cb-artboard')
    await board.getByRole('button', { name: /^Artboard name/ }).click()
    await expect(board.getByRole('textbox')).toHaveCount(0)
    await board.evaluate(node => node.remove())
    await page.clock.runFor(350)
    expect(await page.evaluate(() => window.viewportChanges)).toBe(0)
})

test('centering is cancelable and name typing does not pan or zoom the viewport', async ({ page }) => {
    await inViewport(page, 50)
    const board = page.locator('cb-artboard'), viewport = page.locator('cb-viewport')
    await board.evaluate(node => node.addEventListener('beforecenter', event => event.preventDefault(), { once: true }))
    await board.locator('[data-content]').dblclick()
    await expect(viewport).toHaveJSProperty('zoom', 50)
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick()
    await board.getByRole('textbox').fill('Home 0 + -')
    await board.getByRole('textbox').press('ArrowLeft')
    await expect(viewport).toHaveJSProperty('zoom', 50)
    await expect(viewport).toHaveJSProperty('x', 70)
})

test('zoom-only changes preserve intrinsic dimensions and disconnection cleans up observers', async ({ page }) => {
    await inViewport(page, 110)
    const board = page.locator('cb-artboard')
    for (const zoom of [33, 175, 250.5, 100]) {
        await page.locator('cb-viewport').evaluate((node, zoom) => { (node as Viewport).zoom = zoom }, zoom)
        await expect(board.locator('[part~=frame]')).toHaveCSS('width', '322px')
        await expect(board.locator('[part~=frame]')).toHaveCSS('height', '152px')
    }
    await board.evaluate(node => {
        const parent = node.parentElement!
        node.remove(); parent.append(node)
    })
    await board.locator('[data-content]').evaluate(node => { node.style.width = '410px'; node.style.height = '210px' })
    await expect(board.locator('[part~=frame]')).toHaveCSS('width', '412px')
    await expect(board.locator('[part~=frame]')).toHaveCSS('height', '212px')
})

test('readonly names remain reactive and styling values cannot inject layout declarations', async ({ page }) => {
    await mount(page, { editable: false, background: 'red;position:fixed;inset:0' })
    const board = page.locator('cb-artboard')
    await expect(board.getByRole('button', { name: /^Artboard name/ })).toBeDisabled()
    await board.evaluate(node => { (node as Artboard).name = 'External title' })
    await expect(board.locator('cb-editable-label')).toContainText('External title')
    await expect(board.locator('[part~=frame]')).toHaveCSS('position', 'relative')
    expect(await page.evaluate(() => window.artboardRenames)).toEqual([])
})

test('centering is handled only by the nearest viewport while the event still reaches applications', async ({ page }) => {
    await inViewport(page, 50)
    await page.evaluate(() => {
        const inner = document.querySelector('cb-viewport')!
        const outer = document.createElement('cb-viewport') as Viewport
        Object.assign(outer, { accessibleLabel: 'Outer canvas', zoom: 80, x: 12, y: 8 })
        inner.parentElement!.append(outer)
        outer.append(inner)
        document.addEventListener('center', () => { document.body.dataset.centerObserved = 'true' }, { once: true })
        ;(document.querySelector('cb-artboard') as Artboard).center()
    })
    const viewports = page.locator('cb-viewport')
    await expect(viewports.nth(0)).toHaveJSProperty('zoom', 80)
    await expect(viewports.nth(1)).toHaveJSProperty('zoom', 100)
    await expect(page.locator('body')).toHaveAttribute('data-center-observed', 'true')
})

test('selected and editing artboards remain accessible in both themes', async ({ page }) => {
    await mount(page, { selected: true })
    const board = page.locator('cb-artboard')
    await page.locator('#fixture').evaluate(node => { node.style.cssText = 'padding:40px 20px;background:var(--color-background);color:var(--color-foreground)' })
    for (const appearance of ['light', 'dark']) {
        await page.locator('#theme').evaluate((node, value) => { node.setAttribute('appearance', value) }, appearance)
        expect((await new AxeBuilder({ page }).include('cb-artboard').analyze()).violations).toEqual([])
        await page.screenshot({ path: `test-results/artboard-${appearance}.png` })
    }
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick()
    expect((await new AxeBuilder({ page }).include('cb-artboard').analyze()).violations).toEqual([])
})
