import { expect, test, type Page } from '@playwright/test'
import type { Viewport } from '../../components/editor/viewport/index.js'
import type { ViewportChangeDetail } from '../../components/editor/viewport/ViewportBase.js'

async function mount(page: Page, scale: number): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-viewport')))
    await page.evaluate(scale => {
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { accessibleLabel: 'Canvas', zoom: 80, x: 73, y: -29, controls: false })
        viewport.style.cssText = `width:800px;transform:scale(${scale});transform-origin:top left`
        const content = document.createElement('div')
        content.style.cssText = 'position:relative;width:600px;height:300px'
        const anchor = document.createElement('span')
        anchor.setAttribute('data-anchor', '')
        anchor.style.cssText = 'position:absolute;left:370px;top:80px;width:10px;height:10px;background:red'
        content.append(anchor)
        viewport.append(content)
        document.querySelector('#fixture')!.append(viewport)
        viewport.addEventListener('input', event => {
            if (!(event instanceof CustomEvent)) return
            const detail = (event as CustomEvent<ViewportChangeDetail>).detail
            viewport.dataset.previousZoom = String(detail.previousValue.zoom)
            viewport.dataset.nextZoom = String(detail.value.zoom)
            viewport.dataset.events = String(Number(viewport.dataset.events || 0) + 1)
        })
    }, scale)
}

for (const scale of [1, .75]) {
    test(`wheel zoom keeps the document point under the cursor fixed (outer scale ${scale})`, async ({ page }) => {
        await mount(page, scale)
        const viewport = page.locator('cb-viewport'), anchor = page.locator('[data-anchor]')
        const before = await anchor.boundingBox()
        expect(before).not.toBeNull()
        await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2)
        await page.keyboard.down('Control')
        await page.mouse.wheel(0, -40)
        await expect(viewport).toHaveJSProperty('zoom', 90)
        let after = await anchor.boundingBox()
        expect(after!.x + after!.width / 2).toBeCloseTo(before!.x + before!.width / 2, 0)
        expect(after!.y + after!.height / 2).toBeCloseTo(before!.y + before!.height / 2, 0)
        await expect(viewport).toHaveAttribute('data-events', '1')
        await expect(viewport).toHaveAttribute('data-previous-zoom', '80')
        await expect(viewport).toHaveAttribute('data-next-zoom', '90')
        await page.mouse.wheel(0, 40)
        await page.keyboard.up('Control')
        await expect(viewport).toHaveJSProperty('zoom', 80)
        after = await anchor.boundingBox()
        expect(after!.x + after!.width / 2).toBeCloseTo(before!.x + before!.width / 2, 0)
        expect(after!.y + after!.height / 2).toBeCloseTo(before!.y + before!.height / 2, 0)
        await expect(viewport).toHaveJSProperty('x', 73)
        await expect(viewport).toHaveJSProperty('y', -29)
    })
}

test('cursor zoom respects limits, vetoes, and disabled state without shifting the anchor', async ({ page }) => {
    await mount(page, 1)
    const viewport = page.locator('cb-viewport'), surface = viewport.locator('[part~=viewport]')
    await viewport.evaluate(node => { const viewport = node as Viewport; viewport.minZoom = 80; viewport.maxZoom = 85 })
    await surface.dispatchEvent('wheel', { deltaY: -20, ctrlKey: true, clientX: 250, clientY: 180 })
    await expect(viewport).toHaveJSProperty('zoom', 85)
    const position = await viewport.evaluate(node => ({ x: (node as Viewport).x, y: (node as Viewport).y }))
    for (const deltaY of [-20, 0]) await surface.dispatchEvent('wheel', { deltaY, ctrlKey: true, clientX: 400, clientY: 300 })
    expect(await viewport.evaluate(node => ({ x: (node as Viewport).x, y: (node as Viewport).y }))).toEqual(position)
    await expect(viewport).toHaveAttribute('data-events', '1')
    await viewport.evaluate(node => node.addEventListener('beforeinput', event => event.preventDefault(), { once: true }))
    await surface.dispatchEvent('wheel', { deltaY: 20, ctrlKey: true, clientX: 400, clientY: 300 })
    await expect(viewport).toHaveJSProperty('zoom', 85)
    await viewport.evaluate(node => { (node as Viewport).disabled = true })
    await surface.dispatchEvent('wheel', { deltaY: 20, metaKey: true, clientX: 400, clientY: 300 })
    await expect(viewport).toHaveJSProperty('zoom', 85)
    await expect(viewport).toHaveAttribute('data-events', '1')
})

test('background dragging ignores surrounding theme providers but preserves interactive content', async ({ page }) => {
    await mount(page, 1)
    const viewport = page.locator('cb-viewport'), surface = viewport.locator('[part~=viewport]')
    await expect(viewport.locator('[part~=pan-surface]')).toHaveCount(0)
    const bounds = (await surface.boundingBox())!
    await page.mouse.move(bounds.x + 10, bounds.y + 10)
    await page.mouse.down()
    await page.mouse.move(bounds.x + 60, bounds.y + 30, { steps: 5 })
    await page.mouse.up()
    await expect(viewport).toHaveJSProperty('x', 123)
    await expect(viewport).toHaveJSProperty('y', -9)
    await viewport.evaluate(node => {
        const button = document.createElement('button')
        button.textContent = 'Content action'
        button.style.cssText = 'width:140px;height:60px'
        node.append(button)
    })
    const button = (await page.getByRole('button', { name: 'Content action' }).boundingBox())!
    await page.mouse.move(button.x + 5, button.y + 5)
    await page.mouse.down()
    await page.mouse.move(button.x + 35, button.y + 10, { steps: 3 })
    await page.mouse.up()
    await expect(viewport).toHaveJSProperty('x', 123)
    await expect(viewport).toHaveJSProperty('y', -9)
})

test('hand tool captures iframe content, keeps hand cursors, preserves wheel and native controls, and switches off cleanly', async ({ page }) => {
    await mount(page, 1)
    const viewport = page.locator('cb-viewport'), surface = viewport.locator('[part~=viewport]')
    await viewport.evaluate(node => {
        Object.assign(node as Viewport, { panTool: true, controls: true, zoomInLabel: 'Zoom in' })
        const iframe = document.createElement('iframe')
        iframe.srcdoc = '<button style="width:100%;height:100%">Embedded content</button>'
        iframe.style.cssText = 'width:300px;height:160px'
        node.append(iframe)
    })
    const hand = viewport.locator('[part~=pan-surface]')
    await expect(hand).toBeVisible()
    await expect(hand).toHaveCSS('cursor', 'grab')
    const bounds = (await viewport.locator('iframe').boundingBox())!
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await page.mouse.down()
    await expect(hand).toHaveCSS('cursor', 'grabbing')
    await page.mouse.move(bounds.x + bounds.width / 2 + 40, bounds.y + bounds.height / 2 + 20, { steps: 5 })
    await page.mouse.up()
    await expect(hand).toHaveCSS('cursor', 'grab')
    await expect.poll(() => viewport.evaluate(node => (node as Viewport).x)).toBeCloseTo(113, 3)
    await expect(viewport).toHaveJSProperty('y', -9)
    await page.mouse.wheel(10, 20)
    await expect.poll(() => viewport.evaluate(node => (node as Viewport).x)).toBeCloseTo(103, 3)
    await expect(viewport).toHaveJSProperty('y', -29)
    await viewport.getByRole('button', { name: 'Zoom in', exact: true }).click()
    await expect(viewport).toHaveJSProperty('zoom', 90)
    for (const props of [{ pannable: false }, { pannable: true, disabled: true }, { disabled: false, panTool: false }]) {
        await viewport.evaluate((node, props) => Object.assign(node as Viewport, props), props)
        await expect(hand).toHaveCount(0)
    }
    await expect(surface).not.toHaveCSS('cursor', 'grab')
})
