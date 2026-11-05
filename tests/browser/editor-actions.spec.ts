import { expect, test, type Page, type Locator } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { LayerTree, LayerTreeActionDetail } from '../../components/data-display/layer-tree/index.js'
import type { SelectionOverlay, SelectionActionDetail } from '../../components/editor/selection-overlay/index.js'
import type { Viewport } from '../../components/editor/viewport/index.js'

declare global {
    interface Window {
        editorActionDetails: Array<LayerTreeActionDetail | SelectionActionDetail>
        editorBeforeActions: number
        editorActionLeaks: string[]
        editorActionErrors: string[]
    }
}
const pageErrors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
    const errors: string[] = []; pageErrors.set(page, errors)
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => {
        window.editorActionDetails = []; window.editorBeforeActions = 0; window.editorActionLeaks = []; window.editorActionErrors = []
        document.addEventListener('error', event => {
            if (!(event instanceof CustomEvent)) return
            const detail = (event as CustomEvent<{ code?: string; error?: Error }>).detail
            if (detail?.code === 'COMPONENT_ERROR') window.editorActionErrors.push(detail.error?.message ?? detail.code)
        }, true)
    })
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-selection-overlay')))
})
test.afterEach(async ({ page }) => {
    expect(pageErrors.get(page)).toEqual([])
    expect(await page.evaluate(() => window.editorActionErrors)).toEqual([])
    expect(await page.evaluate(() => window.editorActionLeaks)).toEqual([])
})

async function mountSelection(page: Page, zoom = 100): Promise<void> {
    await page.evaluate(zoom => {
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { accessibleLabel: 'Editor canvas', controls: false, zoom, x: 0, y: 0 })
        viewport.style.cssText = 'width:500px;--component-viewport-height:320px'
        const overlay = document.createElement('cb-selection-overlay') as SelectionOverlay
        Object.assign(overlay, { accessibleLabel: 'Selected content', moveLabel: 'Move selection', resizeLabel: '{handle}',
            actionsLabel: 'Selection commands', showSize: false, resizable: false, rect: { x: -80, y: -60, width: 160, height: 100 },
            actions: [{ id: 'copy', name: 'duplicate', label: 'Copy selection', icon: 'copy' }, { id: 'inspect', name: 'inspect', label: 'Inspect' }] })
        overlay.addEventListener('beforeaction', () => { window.editorBeforeActions++ })
        overlay.addEventListener('action', event => { window.editorActionDetails.push((event as CustomEvent<SelectionActionDetail>).detail) })
        for (const type of ['rectchange', 'rotationchange', 'change']) overlay.addEventListener(type, () => window.editorActionLeaks.push(type))
        viewport.append(overlay); document.querySelector('#fixture')!.append(viewport)
    }, zoom)
    await expect(page.locator('cb-selection-overlay [part~=controls]')).toBeVisible()
}

async function putSelection(page: Page, x: number, y: number): Promise<void> {
    await page.locator('cb-selection-overlay').evaluate((node, { x, y }) => {
        const overlay = node as SelectionOverlay, viewport = overlay.closest('cb-viewport') as Viewport
        const boundary = viewport.getBoundingClientRect(), current = overlay.getBoundingClientRect(), scale = viewport.zoom / 100
        overlay.rect = { ...overlay.rect, x: overlay.rect.x + (boundary.left + x - current.left) / scale, y: overlay.rect.y + (boundary.top + y - current.top) / scale }
    }, { x, y })
}
async function expectAttached(page: Page): Promise<void> {
    await expect.poll(async () => {
        const bar = (await page.locator('[part~=controls][popover]').boundingBox())!, selection = (await page.locator('cb-selection-overlay').boundingBox())!
        return Math.abs(bar.x + bar.width / 2 - selection.x - selection.width / 2) < 1 && Math.abs(bar.y + bar.height + 8 - selection.y) < 1
    }).toBe(true)
}

test('arbitrary layer actions are node-scoped, keyboard accessible, cancelable and do not select or edit nodes', async ({ page }) => {
    await page.evaluate(() => {
        const tree = document.createElement('cb-layer-tree') as LayerTree
        Object.assign(tree, { accessibleLabel: 'Layers', editable: false, showVisibility: false, showLock: false, expandedIds: ['group'],
            items: [{ id: 'group', label: 'Group', children: [
                { id: 'one', label: 'One', actions: [{ id: 'copy', icon: 'copy', name: 'duplicate', label: 'Copy One' }, { id: 'inspect', label: 'Inspect One' }] },
                { id: 'two', label: 'Two', actions: [{ id: 'copy', label: 'Copy Two' }, { id: 'blocked', label: 'Blocked', disabled: true }] },
                { id: 'disabled', label: 'Disabled', disabled: true, actions: [{ id: 'copy', label: 'Disabled copy' }] },
            ] }], expandLabel: 'Expand {item}', collapseLabel: 'Collapse {item}' })
        tree.addEventListener('beforeaction', () => { window.editorBeforeActions++ })
        tree.addEventListener('action', event => window.editorActionDetails.push((event as CustomEvent<LayerTreeActionDetail>).detail))
        for (const type of ['selectionchange', 'itemschange', 'change']) tree.addEventListener(type, () => window.editorActionLeaks.push(type))
        document.querySelector('#fixture')!.append(tree)
    })
    const row = (id: string): Locator => page.locator(`cb-layer-tree [part~=row][data-id="${id}"]`)
    await row('one').hover()
    await page.getByRole('button', { name: 'Copy One', exact: true }).click()
    await page.getByRole('button', { name: 'Inspect One', exact: true }).press('Enter')
    await row('two').focus()
    await page.getByRole('button', { name: 'Copy Two', exact: true }).press('Space')
    expect(await page.evaluate(() => window.editorActionDetails)).toMatchObject([
        { id: 'one', item: { id: 'one' }, action: { id: 'copy', name: 'duplicate', icon: 'copy', label: 'Copy One' } },
        { id: 'one', action: { id: 'inspect' } }, { id: 'two', action: { id: 'copy' } },
    ])
    expect(await page.evaluate(() => window.editorBeforeActions)).toBe(3)
    await expect(page.getByRole('button', { name: 'Blocked', exact: true })).toBeDisabled()
    await row('disabled').hover()
    await expect(page.getByRole('button', { name: 'Disabled copy', exact: true })).toBeDisabled()
    await page.locator('cb-layer-tree').evaluate(node => node.addEventListener('beforeaction', event => event.preventDefault(), { once: true }))
    await row('one').hover()
    await page.getByRole('button', { name: 'Copy One', exact: true }).click()
    expect(await page.evaluate(() => window.editorActionDetails.length)).toBe(3)
    await page.locator('cb-layer-tree').evaluate(node => { const tree = node as LayerTree; tree.items = [{ id: 'new', label: 'New', actions: [{ id: 'new-action', label: 'New action' }] }] })
    await expect(page.getByRole('button', { name: 'Copy One', exact: true })).toHaveCount(0)
    await row('new').hover()
    await page.getByRole('button', { name: 'New action', exact: true }).click()
    expect(await page.evaluate(() => window.editorActionDetails.at(-1))).toMatchObject({ id: 'new', action: { id: 'new-action' } })
})

test('selection commands emit one complete action and honor veto/disabled/reactive action lists', async ({ page }) => {
    await mountSelection(page)
    await page.getByRole('button', { name: 'Copy selection', exact: true }).click()
    await page.getByRole('button', { name: 'Inspect', exact: true }).press('Enter')
    expect(await page.evaluate(() => window.editorBeforeActions)).toBe(2)
    expect(await page.evaluate(() => window.editorActionDetails)).toMatchObject([
        { action: { id: 'copy', name: 'duplicate' }, rect: { x: -80, y: -60, width: 160, height: 100 }, rotation: 0 },
        { action: { id: 'inspect' } },
    ])
    await page.locator('cb-selection-overlay').evaluate(node => node.addEventListener('beforeaction', event => event.preventDefault(), { once: true }))
    await page.getByRole('button', { name: 'Inspect', exact: true }).click()
    expect(await page.evaluate(() => window.editorActionDetails.length)).toBe(2)
    await page.locator('cb-selection-overlay').evaluate(node => { (node as SelectionOverlay).disabled = true })
    await expect(page.getByRole('button', { name: 'Inspect', exact: true })).toBeDisabled()
    await page.locator('cb-selection-overlay').evaluate(node => { Object.assign(node, { disabled: false, actions: [] }) })
    await expect(page.locator('[part~=controls][popover]')).toBeHidden()
    await page.locator('cb-selection-overlay').evaluate(node => { (node as SelectionOverlay).actions = [{ id: 'new', label: 'New command' }] })
    await expect(page.getByRole('button', { name: 'New command', exact: true })).toBeVisible()
})

for (const zoom of [50, 100, 200]) test(`selection controls stay attached rather than pinning to viewport edges at ${zoom}% zoom`, async ({ page }) => {
    await mountSelection(page, zoom)
    const bar = page.locator('[part~=controls][popover]')
    await putSelection(page, 100, 100)
    await expect(bar).toHaveAttribute('data-placement', 'above')
    const initial = (await bar.boundingBox())!
    for (const point of [{ x: 0, y: 0 }, { x: 480, y: 0 }, { x: -150, y: -100 }, { x: 480, y: 300 }]) {
        await putSelection(page, point.x, point.y); await expectAttached(page)
        await expect(bar).toHaveAttribute('data-placement', 'above')
        const controls = (await bar.boundingBox())!, boundary = (await page.locator('cb-viewport').boundingBox())!
        const outside = controls.x + controls.width <= boundary.x || controls.x >= boundary.x + boundary.width ||
            controls.y + controls.height <= boundary.y || controls.y >= boundary.y + boundary.height
        await expect(bar).toHaveJSProperty('inert', outside)
    }
    expect((await bar.boundingBox())!.width).toBeCloseTo(initial.width, 1)
    await page.locator('cb-viewport').evaluate(node => { Object.assign(node, { zoom: 150, x: -250, y: 100 }) })
    await expectAttached(page)
    await page.locator('cb-selection-overlay').evaluate(node => { (node as SelectionOverlay).rotation = 45 })
    await expectAttached(page)
    expect((await bar.boundingBox())!.height).toBeCloseTo(initial.height, 1)
    await page.setViewportSize({ width: 500, height: 600 }); await expectAttached(page)
})

test('selection bar is constrained when oversized and cleaned up on disconnect', async ({ page }) => {
    await mountSelection(page)
    await page.locator('cb-selection-overlay').evaluate(node => { (node as SelectionOverlay).actions = Array.from({ length: 30 }, (_, index) => ({ id: `a${index}`, label: `Action ${index}` })) })
    await expectAttached(page)
    expect((await page.locator('[part~=controls][popover]').boundingBox())!.width).toBeLessThanOrEqual((await page.locator('cb-viewport').boundingBox())!.width - 16)
    await page.locator('cb-selection-overlay').evaluate(node => node.remove())
    await expect(page.getByRole('toolbar')).toHaveCount(0)
    await page.mouse.wheel(0, 100)
})

test('standalone controls follow browser resize and page scroll without a cb-viewport', async ({ page }) => {
    await mountSelection(page)
    await page.evaluate(() => {
        const overlay = document.querySelector('cb-selection-overlay') as SelectionOverlay
        const box = document.createElement('div'); box.style.cssText = 'position:relative;margin-top:800px;height:400px'
        document.querySelector('#fixture')!.append(box); box.append(overlay)
        overlay.rect = { x: 10, y: 10, width: 160, height: 100 }
        box.scrollIntoView()
    })
    const bar = page.locator('[part~=controls][popover]')
    await expect.poll(async () => {
        const bounds = await bar.boundingBox()
        return !!bounds && bounds.y >= 8 && bounds.y + bounds.height <= page.viewportSize()!.height - 7
    }).toBe(true)
    await page.setViewportSize({ width: 320, height: 400 }); await page.evaluate(() => window.scrollTo(0, 0))
    await expect.poll(async () => {
        const bounds = await bar.boundingBox()
        return !!bounds && bounds.x >= 8 && bounds.x + bounds.width <= 313 && bounds.y >= 8 && bounds.y + bounds.height <= 393
    }).toBe(true)
})

for (const style of ['solid', 'dashed', 'dotted']) test(`selection and marquee borders accept ${style} and custom color via parts`, async ({ page }) => {
    await mountSelection(page)
    await page.evaluate(style => {
        const css = document.createElement('style')
        css.textContent = `cb-selection-overlay::part(selection),cb-marquee-selection::part(selection){border-style:${style};border-color:rgb(190,24,93)}`
        document.head.append(css)
        const marquee = document.createElement('cb-marquee-selection'); document.querySelector('#fixture')!.append(marquee)
    }, style)
    for (const part of ['cb-selection-overlay [part~=outline]', 'cb-marquee-selection [part~=marquee]']) {
        await expect(page.locator(part)).toHaveCSS('border-top-style', style)
        await expect(page.locator(part)).toHaveCSS('border-top-color', 'rgb(190, 24, 93)')
    }
})

for (const appearance of ['light', 'dark']) test(`selection commands remain accessible in ${appearance}`, async ({ page }) => {
    await mountSelection(page)
    await page.locator('cb-theme-provider').evaluate((node, appearance) => node.setAttribute('appearance', appearance), appearance)
    await expect(page.getByRole('toolbar', { name: 'Selection commands' })).toBeVisible()
    expect((await new AxeBuilder({ page }).include('cb-viewport').analyze()).violations).toEqual([])
})

test('Storybook demonstrates all three selection border styles as actual components', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--selection-border-styles&viewMode=story')
    await expect(page.locator('cb-selection-overlay')).toHaveCount(3)
    for (const [index, style] of ['solid', 'dashed', 'dotted'].entries()) {
        await expect(page.locator('cb-selection-overlay').nth(index).locator('[part~=outline]')).toHaveCSS('border-top-style', style)
    }
})
