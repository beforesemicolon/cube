import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Artboard, ArtboardGuide, ArtboardGuideEndDetail, ArtboardGuidesDetail } from '../../components/editor/artboard/index.js'
import type { Viewport } from '../../components/editor/viewport/index.js'

declare global {
    interface Window {
        guideChanges: ArtboardGuidesDetail[]
        guideEnds: ArtboardGuideEndDetail[]
        guideErrors: string[]
        guideLeaks: string[]
    }
}

async function mount(page: Page, scale = 1, guides: readonly ArtboardGuide[] = []): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-artboard')))
    await page.evaluate(({ scale, guides }) => {
        window.guideChanges = []; window.guideEnds = []; window.guideErrors = []; window.guideLeaks = []
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, { width: 400, height: 300, name: 'Page', nameLabel: 'Page name', saveLabel: 'Save', cancelLabel: 'Cancel',
            guidesEnabled: true, showGuides: true, guides, horizontalGuideLabel: 'Horizontal guide', verticalGuideLabel: 'Vertical guide',
            guideLabel: 'Guide {id}', guideDistanceLabel: '{start}px · {end}px' })
        board.style.cssText = `margin:60px;transform-origin:top left;transform:scale(${scale})`
        const child = document.createElement('div'); child.style.cssText = 'width:100%;height:100%'; child.textContent = 'Content'
        board.append(child)
        board.addEventListener('guideschange', event => {
            const { value, previousValue, guide, operation } = (event as CustomEvent<ArtboardGuidesDetail>).detail
            window.guideChanges.push({ value, previousValue, guide, operation })
        })
        board.addEventListener('guideend', event => {
            const { value, previousValue, guide, operation, cancelled } = (event as CustomEvent<ArtboardGuideEndDetail>).detail
            window.guideEnds.push({ value, previousValue, guide, operation, cancelled })
        })
        for (const type of ['action', 'change', 'select', 'resize', 'center']) board.addEventListener(type, () => window.guideLeaks.push(type))
        document.addEventListener('COMPONENT_ERROR', event => window.guideErrors.push(String((event as CustomEvent).detail)))
        document.querySelector('#fixture')!.append(board)
    }, { scale, guides })
    await expect(page.locator('cb-artboard [part~=frame]')).toHaveCSS('width', '400px')
}

const frame = (page: Page) => page.locator('cb-artboard [part~=frame]')
async function drag(page: Page, axis: 'x' | 'y', position: number, scale = 1): Promise<void> {
    const box = (await frame(page).boundingBox())!
    const start = axis === 'y' ? { x: box.x + 4, y: box.y + 65 * scale } : { x: box.x + 65 * scale, y: box.y + 4 }
    await page.mouse.move(start.x, start.y); await page.mouse.down()
    await page.mouse.move(axis === 'y' ? box.x + position * scale : start.x, axis === 'x' ? box.y + position * scale : start.y, { steps: 5 })
    await page.mouse.up()
}
test.afterEach(async ({ page }) => {
    expect(await page.evaluate(() => window.guideErrors ?? [])).toEqual([])
    expect(await page.evaluate(() => window.guideLeaks ?? [])).toEqual([])
})

for (const scale of [.5, 1, 2]) test(`guide creation, live distances, and center snapping at scale ${scale}`, async ({ page }) => {
    await mount(page, scale)
    await drag(page, 'y', 200 - 2 / scale, scale)
    await expect(page.locator('[part~=guide-handle]')).toHaveCount(1)
    expect(await page.evaluate(() => window.guideEnds)).toMatchObject([{ operation: 'create', cancelled: false, previousValue: [], value: [{ axis: 'y', position: 200 }] }])
    const handle = page.getByRole('slider')
    await handle.hover()
    await expect(page.locator('cb-guide-overlay [part~=label]')).toHaveText('200 · 200')
    await drag(page, 'x', 80, scale)
    await expect(page.getByRole('slider')).toHaveCount(2)
    expect(await page.evaluate(() => window.guideEnds[1].value)).toMatchObject([{ axis: 'y', position: 200 }, { axis: 'x', position: 80 }])
    expect(await page.evaluate(() => window.guideChanges.every((event, index, all) => JSON.stringify(event.previousValue) === JSON.stringify(index ? all[index - 1].value : [])))).toBe(true)
    await expect(frame(page)).toHaveCSS('height', '300px')
})

test('moving a guide supports Escape rollback, outside removal, and visibility persistence', async ({ page }) => {
    await mount(page, 1, [{ id: 'margin', axis: 'y', position: 40 }])
    const box = (await frame(page).boundingBox())!
    await page.mouse.move(box.x + 40, box.y + 90); await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + 90, { steps: 4 })
    await page.keyboard.press('Escape'); await page.mouse.up()
    expect(await page.evaluate(() => window.guideEnds)).toMatchObject([{ operation: 'cancel', cancelled: true, value: [{ position: 40 }] }])
    await page.locator('cb-artboard').evaluate(node => { (node as Artboard).showGuides = false })
    await expect(page.getByRole('slider')).toHaveCount(0)
    await page.locator('cb-artboard').evaluate(node => { (node as Artboard).showGuides = true })
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '40')
    await page.mouse.move(box.x + 40, box.y + 90); await page.mouse.down()
    await page.mouse.move(box.x - 20, box.y + 90, { steps: 4 }); await page.mouse.up()
    await expect(page.getByRole('slider')).toHaveCount(0)
    expect(await page.evaluate(() => window.guideEnds.at(-1))).toMatchObject({ operation: 'remove', value: [] })
})

test('keyboard creation, nudging, endpoints, deletion, veto and programmatic restoration', async ({ page }) => {
    await mount(page)
    const creator = page.getByRole('button', { name: 'Vertical guide', exact: true })
    await creator.focus(); await creator.press('Enter')
    const slider = page.getByRole('slider')
    await expect(slider).toHaveAttribute('aria-valuenow', '200')
    await slider.focus(); await slider.press('Shift+ArrowRight')
    await expect(slider).toHaveAttribute('aria-valuenow', '210')
    await slider.press('Home'); await expect(slider).toHaveAttribute('aria-valuenow', '0')
    await slider.press('End'); await expect(slider).toHaveAttribute('aria-valuenow', '400')
    await page.locator('cb-artboard').evaluate(node => node.addEventListener('beforeguideschange', event => event.preventDefault(), { once: true }))
    await slider.press('ArrowLeft'); await expect(slider).toHaveAttribute('aria-valuenow', '400')
    await slider.press('Delete'); await expect(slider).toHaveCount(0)
    const count = await page.evaluate(() => window.guideChanges.length)
    await page.locator('cb-artboard').evaluate(node => { (node as Artboard).guides = [{ id: 'restored', axis: 'x', position: 30 }] })
    await expect(slider).toHaveAttribute('aria-valuenow', '30')
    expect(await page.evaluate(() => window.guideChanges.length)).toBe(count)
})

test('disabling guides during a drag rolls back and releases capture', async ({ page }) => {
    await mount(page, 1, [{ id: 'a', axis: 'x', position: 50 }])
    const box = (await frame(page).boundingBox())!
    await page.mouse.move(box.x + 100, box.y + 50); await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + 90, { steps: 3 })
    await page.locator('cb-artboard').evaluate(node => { (node as Artboard).guidesEnabled = false })
    await page.mouse.up()
    expect(await page.evaluate(() => window.guideEnds.at(-1))).toMatchObject({ cancelled: true, value: [{ position: 50 }] })
    await page.locator('cb-artboard').evaluate(node => { (node as Artboard).guidesEnabled = true })
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '50')
})

test('guides remain local inside a zoomed viewport and do not start panning', async ({ page }) => {
    await mount(page)
    await page.evaluate(() => {
        const board = document.querySelector('cb-artboard') as Artboard
        board.style.cssText = 'position:absolute;left:40px;top:40px'
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { accessibleLabel: 'Canvas', zoom: 50, x: 0, y: 0, controls: false })
        viewport.style.width = '1000px'
        document.querySelector('#fixture')!.append(viewport); viewport.append(board)
    })
    await expect(frame(page)).toHaveCSS('width', '400px')
    await drag(page, 'y', 120, .5)
    const viewport = page.locator('cb-viewport')
    await expect(viewport).toHaveJSProperty('x', 0); await expect(viewport).toHaveJSProperty('y', 0)
    expect(await page.evaluate(() => window.guideEnds.at(-1)?.value)).toMatchObject([{ position: 120 }])
    await viewport.evaluate(node => { (node as Viewport).zoom = 150 })
    await expect.poll(async () => (await frame(page).boundingBox())?.width).toBe(600)
    await drag(page, 'x', 100, 1.5)
    expect(await page.evaluate(() => window.guideEnds.at(-1)?.value)).toMatchObject([{ position: 120 }, { position: 100 }])
})

test('pointer cancellation restores state, and another artboard receives no guide changes', async ({ page }) => {
    await mount(page, 1, [{ id: 'first', axis: 'y', position: 40 }])
    await page.evaluate(() => {
        const second = document.createElement('cb-artboard') as Artboard
        Object.assign(second, { width: 100, height: 100, editable: false, name: 'Other', guides: [{ id: 'other', axis: 'x', position: 10 }] })
        second.id = 'other-board'; document.querySelector('#fixture')!.append(second)
    })
    const box = (await frame(page).first().boundingBox())!
    await page.mouse.move(box.x + 40, box.y + 90); await page.mouse.down()
    await page.mouse.move(box.x + 130, box.y + 90)
    await page.locator('[data-guide-id=first]').evaluate(node => node.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 })))
    await page.mouse.up()
    expect(await page.evaluate(() => window.guideEnds.at(-1))).toMatchObject({ cancelled: true, value: [{ position: 40 }] })
    await expect(page.locator('#other-board')).toHaveJSProperty('guides', [{ id: 'other', axis: 'x', position: 10 }])
})

for (const theme of ['light', 'dark']) test(`guide controls have accessible names and slider values in ${theme}`, async ({ page }) => {
    await mount(page, 1, [{ id: 'margin', axis: 'y', position: 24 }])
    await page.locator('cb-theme-provider').evaluate((node, theme) => node.setAttribute('appearance', theme), theme)
    const slider = page.getByRole('slider', { name: 'Guide margin' })
    await expect(slider).toHaveAttribute('aria-valuemin', '0')
    await expect(slider).toHaveAttribute('aria-valuemax', '400')
    await expect(slider).toHaveAttribute('aria-valuetext', '24px · 376px')
    const result = await new AxeBuilder({ page }).include('cb-artboard').analyze()
    expect(result.violations).toEqual([])
})
