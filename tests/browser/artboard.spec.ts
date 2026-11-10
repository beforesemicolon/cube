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
        const bounds = (await frame.boundingBox())!
        const x = edge === 'w' ? bounds.x : edge === 'e' ? bounds.x + bounds.width : bounds.x + bounds.width / 3
        const y = edge === 'n' ? bounds.y : edge === 's' ? bounds.y + bounds.height : bounds.y + bounds.height / 3
        await page.mouse.move(x, y)
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
    await expect(board.locator('[part~=resize-handle]:visible')).toHaveCount(0)
    await expect(board.locator('[part~=selection-edge]:visible')).toHaveCount(4)
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

test('clicking content, stopped child actions and every border selects once without interfering with content', async ({ page }) => {
    await mount(page)
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    await board.locator('[data-content]').evaluate(node => {
        const button = document.createElement('cb-button')
        button.setAttribute('label', 'Content action')
        button.addEventListener('click', event => event.stopPropagation())
        button.addEventListener('action', event => {
            event.stopPropagation()
            document.body.dataset.contentActions = String(Number(document.body.dataset.contentActions || 0) + 1)
        })
        node.append(button)
    })
    await board.getByRole('button', { name: 'Content action', exact: true }).click()
    await expect(board).toHaveJSProperty('selected', true)
    await expect(page.locator('body')).toHaveAttribute('data-content-actions', '1')
    expect(await page.evaluate(() => window.artboardSelections)).toBe(1)
    await board.getByRole('button', { name: 'Content action', exact: true }).click()
    expect(await page.evaluate(() => window.artboardSelections)).toBe(1)
    for (const edge of ['n', 'e', 's', 'w'] as const) {
        await board.evaluate(node => { (node as Artboard).selected = false })
        const bounds = (await frame.boundingBox())!
        const x = edge === 'w' ? bounds.x + .5 : edge === 'e' ? bounds.x + bounds.width - .5 : bounds.x + bounds.width / 3
        const y = edge === 'n' ? bounds.y + .5 : edge === 's' ? bounds.y + bounds.height - .5 : bounds.y + bounds.height / 3
        const count = await page.evaluate(() => window.artboardSelections)
        await page.mouse.click(x, y)
        await expect(board).toHaveJSProperty('selected', true)
        expect(await page.evaluate(() => window.artboardSelections)).toBe(count + 1)
    }
    await board.evaluate(node => { (node as Artboard).selected = false; node.addEventListener('beforeselect', event => event.preventDefault(), { once: true }) })
    await board.getByRole('button', { name: 'Content action', exact: true }).click()
    await expect(board).toHaveJSProperty('selected', false)
    for (const props of [{ selectable: false }, { selectable: true, disabled: true }] as const) {
        await board.evaluate((node, props) => Object.assign(node, props), props)
        await board.locator('[data-content]').click({ position: { x: 250, y: 100 } })
        await expect(board).toHaveJSProperty('selected', false)
    }
})

for (const crossOrigin of [false, true]) test(`${crossOrigin ? 'cross-origin' : 'same-origin'} iframe content selects its artboard while remaining interactive`, async ({ page }) => {
    await mount(page)
    const board = page.locator('cb-artboard')
    await board.locator('[data-content]').evaluate((node, crossOrigin) => {
        const frame = document.createElement('iframe')
        frame.title = 'Artboard preview'
        frame.style.cssText = 'width:300px;height:120px;border:0'
        const content = '<button onclick="this.textContent=\'Clicked\';event.stopPropagation()">Frame action</button>'
        if (crossOrigin) frame.src = `data:text/html,${encodeURIComponent(content)}`
        else frame.srcdoc = content
        node.replaceChildren(frame)
    }, crossOrigin)
    const preview = board.frameLocator('iframe')
    await preview.getByRole('button', { name: 'Frame action', exact: true }).click()
    await expect(board).toHaveJSProperty('selected', true)
    await expect(preview.getByRole('button', { name: 'Clicked', exact: true })).toBeVisible()
    expect(await page.evaluate(() => window.artboardSelections)).toBe(1)
    if (!crossOrigin) {
        await board.evaluate(node => { (node as Artboard).selected = false; node.addEventListener('beforeselect', event => event.preventDefault(), { once: true }) })
        await preview.getByRole('button', { name: 'Clicked', exact: true }).click()
        await expect(board).toHaveJSProperty('selected', false)
        await preview.getByRole('button', { name: 'Clicked', exact: true }).click()
        await expect(board).toHaveJSProperty('selected', true)
        await board.evaluate(node => { (node as Artboard).selected = false })
        await board.locator('iframe').evaluate(node => { (node as HTMLIFrameElement).srcdoc = '<button>Reloaded content</button>' })
        await preview.getByRole('button', { name: 'Reloaded content', exact: true }).click()
        await expect(board).toHaveJSProperty('selected', true)
        const oldDocument = await board.locator('iframe').evaluateHandle(node => (node as HTMLIFrameElement).contentDocument)
        await board.locator('iframe').evaluate(node => node.remove())
        await board.evaluate(node => { (node as Artboard).selected = false })
        await oldDocument.evaluate(doc => doc?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
        await expect(board).toHaveJSProperty('selected', false)
        await oldDocument.dispose()
    }
})

test('nested artboard clicks select only their owner and hand-tool drags never select an artboard', async ({ page }) => {
    await mount(page)
    const board = page.locator('cb-artboard').first()
    await board.locator('[data-content]').evaluate(node => {
        const nested = document.createElement('cb-artboard') as Artboard
        Object.assign(nested, { width: 100, height: 60, name: 'Nested', editable: false })
        const content = document.createElement('p')
        content.textContent = 'Nested content'
        nested.append(content)
        node.append(nested)
    })
    await page.getByText('Nested content', { exact: true }).click()
    await expect(page.locator('cb-artboard').nth(1)).toHaveJSProperty('selected', true)
    await expect(board).toHaveJSProperty('selected', false)
    await page.evaluate(() => {
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { panTool: true, accessibleLabel: 'Canvas' })
        viewport.style.width = '800px'
        viewport.append(document.querySelector('cb-artboard')!)
        document.querySelector('#fixture')!.append(viewport)
    })
    const bounds = (await board.locator('[part~=frame]').first().boundingBox())!
    await page.mouse.move(bounds.x + 20, bounds.y + 20)
    await page.mouse.down()
    await page.mouse.move(bounds.x + 80, bounds.y + 50)
    await page.mouse.up()
    await expect(page.locator('cb-viewport')).toHaveJSProperty('x', 60)
    await expect(board).toHaveJSProperty('selected', false)
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

for (const zoom of [10, 30, 100, 200]) test(`unselected artboards have a six-screen-pixel border target at ${zoom}% zoom without affecting size or content`, async ({ page }) => {
    await inViewport(page, zoom)
    const viewport = page.locator('cb-viewport'), board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    await viewport.evaluate((node, zoom) => Object.assign(node, { minZoom: 10, zoom, x: 0, y: 0 } satisfies Partial<Viewport>), zoom)
    await board.evaluate(node => { (node as Artboard).selected = false })
    await board.locator('[data-content]').evaluate(node => {
        const preview = document.createElement('iframe')
        preview.srcdoc = '<body style="margin:0">Full-bleed page content</body>'
        preview.style.cssText = 'display:block;border:0;width:100%;height:100%'
        node.replaceChildren(preview)
    })
    await expect(board.locator('[part~=selection-edge]:visible')).toHaveCount(4)
    const bounds = (await frame.boundingBox())!
    expect(bounds.width).toBeCloseTo(322 * zoom / 100, 1)
    expect(bounds.height).toBeCloseTo(152 * zoom / 100, 1)
    const points = [
        [bounds.x - 5, bounds.y + bounds.height / 3],
        [bounds.x + bounds.width + 5, bounds.y + bounds.height / 3],
        [bounds.x + bounds.width / 3, bounds.y - 5],
        [bounds.x + bounds.width / 3, bounds.y + bounds.height + 5],
        [bounds.x - 5, bounds.y - 5],
        [bounds.x + bounds.width + 5, bounds.y + bounds.height + 5],
    ] as const
    for (const [x, y] of points) {
        await board.evaluate(node => { (node as Artboard).selected = false })
        await expect(board).toHaveJSProperty('selected', false)
        await expect(frame).not.toHaveAttribute('data-selected')
        const count = await page.evaluate(() => window.artboardSelections)
        await page.mouse.click(x, y)
        await expect(board).toHaveJSProperty('selected', true)
        expect(await page.evaluate(() => window.artboardSelections)).toBe(count + 1)
        const size = (await frame.boundingBox())!
        expect(size.width).toBeCloseTo(bounds.width, 1)
        expect(size.height).toBeCloseTo(bounds.height, 1)
    }
    expect(await page.evaluate(() => window.artboardResizes)).toEqual([])
    expect(await page.evaluate(() => window.artboardRenames)).toEqual([])
    await board.evaluate(node => { (node as Artboard).selected = false })
    await page.mouse.click(bounds.x + bounds.width + 9, bounds.y + bounds.height / 3)
    await expect(board).toHaveJSProperty('selected', false)
    await board.getByRole('button', { name: /^Artboard name/ }).dblclick()
    await expect(board.getByRole('textbox', { name: 'Artboard name', exact: true })).toBeVisible()
})

test('the expanded artboard border respects selection vetoes, flags, and the hand tool', async ({ page }) => {
    await inViewport(page, 30)
    const viewport = page.locator('cb-viewport'), board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    await board.evaluate(node => {
        Object.assign(node, { selected: false, resizable: false } satisfies Partial<Artboard>)
        node.addEventListener('beforeselect', event => event.preventDefault(), { once: true })
    })
    const bounds = (await frame.boundingBox())!, x = bounds.x + bounds.width + 5, y = bounds.y + bounds.height / 3
    await page.mouse.click(x, y)
    await expect(board).toHaveJSProperty('selected', false)
    await page.mouse.click(x, y)
    await expect(board).toHaveJSProperty('selected', true)
    for (const props of [{ selected: false, selectable: false }, { selectable: true, disabled: true }] as const) {
        await board.evaluate((node, props) => Object.assign(node, props), props)
        await expect(board.locator('[part~=selection-edge]:visible')).toHaveCount(0)
        await page.mouse.click(x, y)
        await expect(board).toHaveJSProperty('selected', false)
    }
    await board.evaluate(node => Object.assign(node, { disabled: false, selectable: false, selected: true, resizable: true } satisfies Partial<Artboard>))
    await expect(board.locator('[part~=selection-edge]:visible')).toHaveCount(4)
    await page.mouse.move(x, y)
    await expect(board.getByRole('button', { name: 'Resize corner', exact: true })).toHaveCSS('opacity', '1')
    await board.evaluate(node => Object.assign(node, { selected: false, selectable: true } satisfies Partial<Artboard>))
    await viewport.evaluate(node => Object.assign(node, { panTool: true } satisfies Partial<Viewport>))
    await expect(viewport.locator('[part~=pan-surface]')).toBeVisible()
    const origin = await viewport.evaluate(node => ({ x: (node as Viewport).x, y: (node as Viewport).y }))
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 60, y + 30)
    await page.mouse.up()
    await expect(viewport).toHaveJSProperty('x', origin.x + 60)
    await expect(viewport).toHaveJSProperty('y', origin.y + 30)
    await expect(board).toHaveJSProperty('selected', false)
})

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
    test(`${target === 'name' ? 'single' : 'double'}-clicking the ${target} centers a fitting artboard at actual size, independent of zoom and pan`, async ({ page }) => {
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

for (const zoom of [30, 175]) for (const activation of ['click', 'Enter', 'Space'] as const) {
    test(`focusing a long artboard with ${activation} from ${zoom}% keeps its beginning near the viewport top`, async ({ page }) => {
        await inViewport(page, zoom)
        const board = page.locator('cb-artboard'), viewport = page.locator('cb-viewport'), frame = board.locator('[part~=frame]')
        await board.locator('[data-content]').evaluate(node => { node.style.cssText = 'width:840px;height:5120px;background:var(--color-surface-muted)' })
        await expect(frame).toHaveCSS('height', '5122px')
        // Start with the title visible at an arbitrary pan/zoom, like a canvas
        // containing several long pages, so the actual name gesture is used.
        await viewport.evaluate(node => {
            const view = node as Viewport, board = view.querySelector('cb-artboard')!
            const surface = view.shadowRoot!.querySelector('[part~=viewport]')!.getBoundingClientRect()
            const bounds = board.getBoundingClientRect()
            view.x += surface.left + 100 - bounds.left
            view.y += surface.top + 100 - bounds.top
            window.viewportChanges = 0
        })
        const name = board.getByRole('button', { name: /^Artboard name/ })
        if (activation === 'click') await name.click()
        else await name.press(activation === 'Space' ? ' ' : activation)
        await expect(viewport).toHaveJSProperty('zoom', 100)
        await expect.poll(async () => {
            const b = await frame.boundingBox(), v = await viewport.locator('[part~=viewport]').boundingBox()
            return !b || !v ? Infinity : Math.max(Math.abs(b.x + b.width / 2 - v.x - v.width / 2), Math.abs(b.y - v.y - Math.min(96, v.height / 4)))
        }).toBeLessThan(1)
        await expect(board).toHaveJSProperty('selected', true)
        await expect(frame).toHaveCSS('height', '5122px')
        await expect(board.getByRole('textbox')).toHaveCount(0)
        expect(await page.evaluate(() => window.viewportChanges)).toBe(1)
    })
}

test('a 560px artboard fits fully centered in a taller viewport, even when zoomed out initially', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1100 })
    await inViewport(page, 30)
    const board = page.locator('cb-artboard'), viewport = page.locator('cb-viewport'), frame = board.locator('[part~=frame]')
    await viewport.evaluate(node => { (node as HTMLElement).style.setProperty('--component-viewport-height', '900px') })
    await board.locator('[data-content]').evaluate(node => { node.style.cssText = 'width:840px;height:558px' })
    await expect(frame).toHaveCSS('height', '560px')
    await board.getByRole('button', { name: /^Artboard name/ }).click()
    await expect(viewport).toHaveJSProperty('zoom', 100)
    await expect.poll(async () => {
        const b = await frame.boundingBox(), v = await viewport.locator('[part~=viewport]').boundingBox()
        return !b || !v ? Infinity : Math.max(Math.abs(b.x + b.width / 2 - v.x - v.width / 2), Math.abs(b.y + b.height / 2 - v.y - v.height / 2))
    }).toBeLessThan(1)
    const b = await frame.boundingBox(), v = await viewport.locator('[part~=viewport]').boundingBox()
    expect(b!.y).toBeGreaterThan(v!.y)
    expect(b!.y + b!.height).toBeLessThan(v!.y + v!.height)
})

test('double-clicking the name edits without centering and F2 remains available', async ({ page }) => {
    await inViewport(page, 50)
    const board = page.locator('cb-artboard'), viewport = page.locator('cb-viewport')
    await board.evaluate(node => { (node as Artboard).selected = false })
    const name = board.getByRole('button', { name: /^Artboard name/ })
    await expect(name).toBeVisible()
    await page.clock.install()
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1_000)
    // Drive the real double-click while keeping the single-click timer paused.
    await name.dblclick({ force: true })
    await expect(board.getByRole('textbox')).toHaveValue('Homepage')
    await expect(board).toHaveJSProperty('selected', true)
    await page.clock.runFor(350)
    await expect(viewport).toHaveJSProperty('zoom', 50)
    expect(await page.evaluate(() => window.viewportChanges)).toBe(0)
    await page.clock.resume()
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
    await expect(board.getByRole('button', { name: /^Artboard name/ })).toBeEnabled()
    await board.evaluate(node => { (node as Artboard).name = 'External title' })
    await expect(board.getByRole('button', { name: 'Artboard name: External title', exact: true })).toBeVisible()
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

for (const zoom of [30, 100, 200]) test(`all artboard borders resize away from midpoint handles at ${zoom}% zoom`, async ({ page }) => {
    await inViewport(page, zoom)
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]'), viewport = page.locator('cb-viewport')
    await viewport.evaluate((node, zoom) => { (node as Viewport).setViewport(zoom, 80, 80) }, zoom)
    for (const edge of ['n', 'e', 's', 'w'] as const) {
        await board.evaluate(node => Object.assign(node, { width: 320, height: 240, selected: true } satisfies Partial<Artboard>))
        const point = (bounds: { x: number; y: number; width: number; height: number }): { x: number; y: number } => ({
            x: edge === 'w' ? bounds.x - .5 : edge === 'e' ? bounds.x + bounds.width + .5 : bounds.x + bounds.width * .75,
            y: edge === 'n' ? bounds.y - .5 : edge === 's' ? bounds.y + bounds.height + .5 : bounds.y + bounds.height * .25,
        })
        const before = point((await frame.boundingBox())!), surface = (await viewport.boundingBox())!
        await viewport.evaluate((node, delta) => { (node as Viewport).panBy(delta.x, delta.y) }, {
            x: Math.max(surface.x + 100, Math.min(surface.x + surface.width - 100, before.x)) - before.x,
            y: Math.max(surface.y + 100, Math.min(surface.y + surface.height - 100, before.y)) - before.y,
        })
        const { x, y } = point((await frame.boundingBox())!), scale = zoom / 100
        await expect(board.locator(`[part~=selection-edge-${edge}]`)).toHaveCSS('cursor', edge === 'e' || edge === 'w' ? 'ew-resize' : 'ns-resize')
        await page.mouse.move(x, y); await page.mouse.down()
        await page.mouse.move(x + (edge === 'e' ? 40 * scale : edge === 'w' ? -40 * scale : 0), y + (edge === 's' ? 40 * scale : edge === 'n' ? -40 * scale : 0))
        await page.mouse.up()
        await expect(board).toHaveJSProperty('width', edge === 'e' || edge === 'w' ? 360 : 320)
        await expect(board).toHaveJSProperty('height', edge === 'n' || edge === 's' ? 280 : 240)
    }
})

test('a tall artboard resizes near its visible top while its midpoint handle is offscreen', async ({ page }) => {
    await mount(page, { selected: true, width: 320, height: 4000 })
    const board = page.locator('cb-artboard'), frame = board.locator('[part~=frame]')
    const bounds = (await frame.boundingBox())!, midpoint = (await board.getByRole('button', { name: 'Resize right', exact: true }).boundingBox())!
    expect(midpoint.y).toBeGreaterThan(page.viewportSize()!.height)
    await page.mouse.move(bounds.x + bounds.width + 3, bounds.y + 45); await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width + 53, bounds.y + 45); await page.mouse.up()
    await expect(board).toHaveJSProperty('width', 370)
    await expect(board).toHaveJSProperty('height', 4000)
    const changes = await page.evaluate(() => window.artboardResizes.length)
    await page.mouse.move(bounds.x + bounds.width + 100, bounds.y + 45)
    expect(await page.evaluate(() => window.artboardResizes.length)).toBe(changes)
})

test('noneditable header selects without a rename editor and exposes icon, route and action slot', async ({ page }) => {
    await mount(page, { name: 'About', nameIcon: 'file', nameDescription: '/about', editable: false })
    const board = page.locator('cb-artboard')
    await board.evaluate(node => { node.addEventListener('headeractivate', () => node.setAttribute('data-header-activated', 'true')) })
    await expect(board.locator('cb-editable-label')).toHaveCount(0)
    await expect(board.locator('[part~=name-description]')).toHaveText('/about')
    await expect(board.locator('[part~=name-label]')).toHaveText('About')
    const name = board.getByRole('button', { name: 'Artboard name: About', exact: true })
    await name.click()
    await expect(board).toHaveJSProperty('selected', true)
    await expect(board).toHaveAttribute('data-header-activated', 'true')
    await name.dblclick()
    await expect(board.getByRole('textbox')).toHaveCount(0)
    await board.evaluate(node => node.removeAttribute('data-header-activated'))
    await name.press('Enter')
    await expect(board).toHaveAttribute('data-header-activated', 'true')
    await expect(board.locator('slot[name=header-actions]')).toHaveCount(1)
    expect(await page.evaluate(() => window.artboardRenames)).toEqual([])
})
