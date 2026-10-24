import { expect, test, type Page } from '@playwright/test'
import type { GuideOverlay, EditorGuide } from '../../components/editor/guide-overlay/index.js'
import type { Viewport } from '../../components/editor/viewport/index.js'

const edges: readonly EditorGuide[] = [
    { id: 'left', axis: 'x', position: 100, start: 0, end: 2, label: 'Width 838px', type: 'measurement' },
    { id: 'right', axis: 'x', position: 100, start: 318, end: 320, label: 'Height 129.2px', type: 'measurement' },
    { id: 'top', axis: 'y', position: 160, start: 0, end: 2, label: '2px', type: 'measurement' },
    { id: 'bottom', axis: 'y', position: 160, start: 218, end: 220, label: '2px', type: 'measurement' },
    { id: 'corner', axis: 'x', position: 0, start: 0, end: 2, label: 'Corner guide', type: 'snap' },
]

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-guide-overlay')))
    await page.evaluate(guides => {
        const clip = document.createElement('div')
        clip.id = 'clip'
        clip.style.cssText = 'position:relative;width:320px;height:220px;overflow:hidden;border:4px solid black'
        const overlay = document.createElement('cb-guide-overlay') as GuideOverlay
        overlay.guides = guides
        clip.append(overlay)
        document.querySelector('#fixture')!.append(clip)
    }, edges)
})

async function contained(page: Page, count = 5): Promise<void> {
    await expect(page.locator('cb-guide-overlay [part~=label]')).toHaveCount(count)
    await expect.poll(() => page.locator('cb-guide-overlay').evaluate(node => {
        const view = node.ownerDocument.defaultView!
        const clipNode = node.closest<HTMLElement>('#clip')!, clip = clipNode.getBoundingClientRect(), host = node.getBoundingClientRect()
        const sx = clip.width / clipNode.offsetWidth, sy = clip.height / clipNode.offsetHeight
        const clipLeft = clip.left + clipNode.clientLeft * sx, clipTop = clip.top + clipNode.clientTop * sy
        const viewport = node.closest('cb-viewport')?.getBoundingClientRect()
        const left = Math.max(clipLeft, host.left, viewport?.left ?? 0, 0)
        const top = Math.max(clipTop, host.top, viewport?.top ?? 0, 0)
        const right = Math.min(clipLeft + clipNode.clientWidth * sx, host.right, viewport?.right ?? view.innerWidth, view.innerWidth)
        const bottom = Math.min(clipTop + clipNode.clientHeight * sy, host.bottom, viewport?.bottom ?? view.innerHeight, view.innerHeight)
        const lines = new Map([...node.shadowRoot!.querySelectorAll<HTMLElement>('[part~=line]')].map(line => [line.dataset.id, line.getBoundingClientRect()]))
        return [...node.shadowRoot!.querySelectorAll<HTMLElement>('[part~=label]')].every(label => {
            const rect = label.getBoundingClientRect()
            const line = lines.get(label.dataset.guideLabelId)
            const visible = !!line && line.left < right && line.right > left && line.top < bottom && line.bottom > top
            if (!visible) return getComputedStyle(label).visibility === 'hidden'
            return getComputedStyle(label).visibility === 'visible' && rect.width > 0 && rect.height > 0 &&
                rect.left >= left - 1 && rect.top >= top - 1 && rect.right <= right + 1 && rect.bottom <= bottom + 1
        })
    })).toBe(true)
}

test('guide labels fit all overlay edges and corners without moving their lines or intercepting input', async ({ page }) => {
    await contained(page)
    await expect(page.locator('[part~=label]')).toHaveText(['838', '129.2', '2', '2', 'Corner guide'])
    await expect(page.locator('[part~=label]').first()).toHaveCSS('font-size', '10px')
    await expect(page.locator('[part~=line][data-id=left]')).toHaveCSS('width', '2px')
    await expect(page.locator('[part~=line][data-id=right]')).toHaveCSS('inset-inline-start', '318px')
    await expect(page.locator('cb-guide-overlay')).toHaveCSS('pointer-events', 'none')
    for (const zoom of [.5, 2]) {
        await page.locator('cb-guide-overlay').evaluate((node, zoom) => { (node as GuideOverlay).zoom = zoom }, zoom)
        await contained(page)
    }
})

test('guide labels follow native viewport zoom and pan across clipping boundaries', async ({ page }) => {
    await page.evaluate(() => {
        const clip = document.querySelector<HTMLElement>('#clip')!
        clip.style.cssText = 'position:absolute;left:-160px;top:-110px;width:320px;height:220px;overflow:hidden'
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { accessibleLabel: 'Canvas', zoom: 100, x: 0, y: 0, controls: false })
        viewport.style.cssText = 'width:450px;--component-viewport-height:320px'
        document.querySelector('#fixture')!.append(viewport)
        viewport.append(clip)
    })
    for (const zoom of [50, 100, 200]) {
        await page.locator('cb-viewport').evaluate((node, zoom) => { (node as Viewport).setViewport(zoom, 80, 60) }, zoom)
        await contained(page)
        await expect.poll(() => page.locator('cb-guide-overlay [part~=label]').evaluateAll(nodes =>
            nodes.every(node => getComputedStyle(node).visibility === 'hidden' || Math.abs(node.getBoundingClientRect().height - 17) < 1))).toBe(true)
        await page.locator('cb-viewport').evaluate((node, zoom) => { (node as Viewport).setViewport(zoom, -80, -60) }, zoom)
        await contained(page)
    }
})

test('labels account for browser resize, ancestor scrolling and changed label sizes', async ({ page }) => {
    await page.evaluate(() => {
        const clip = document.querySelector<HTMLElement>('#clip')!
        clip.style.cssText += ';position:fixed;left:250px;top:100px;overflow:auto'
        const content = document.createElement('div')
        content.style.cssText = 'position:relative;width:700px;height:500px'
        const overlay = clip.querySelector('cb-guide-overlay')!
        content.append(overlay); clip.append(content)
    })
    await page.setViewportSize({ width: 500, height: 300 })
    await contained(page)
    await page.locator('#clip').evaluate(node => node.scrollTo(150, 100))
    await contained(page)
    await page.locator('cb-guide-overlay').evaluate(node => {
        const overlay = node as GuideOverlay
        overlay.guides = overlay.guides.map(guide => ({ ...guide, label: `${guide.label} — a much longer measurement label` }))
    })
    await contained(page)
    await page.setViewportSize({ width: 400, height: 240 })
    await contained(page)
})

test('hidden overlays do not leak labels and recover when shown or reattached', async ({ page }) => {
    await contained(page)
    await page.locator('#clip').evaluate(node => { (node as HTMLElement).hidden = true })
    await expect(page.locator('[part~=label]').first()).not.toBeVisible()
    await page.locator('#clip').evaluate(node => { (node as HTMLElement).hidden = false })
    await contained(page)
    await page.locator('cb-guide-overlay').evaluate(node => { const parent = node.parentNode!; node.remove(); parent.appendChild(node) })
    await contained(page)
})

test('labels stay in their artboard and disappear when their line leaves its visible area', async ({ page }) => {
    await page.evaluate(() => {
        const clip = document.querySelector<HTMLElement>('#clip')!
        const artboard = document.createElement('div')
        artboard.style.cssText = 'position:relative;width:700px;height:220px'
        const iframe = document.createElement('iframe')
        iframe.title = 'Page viewport'
        iframe.style.cssText = 'display:block;width:100%;height:100%;border:0'
        const overlay = clip.querySelector('cb-guide-overlay') as GuideOverlay
        overlay.guides = [
            { id: 'inside', axis: 'x', position: 80, start: 0, end: 300, label: '300' },
            { id: 'outside', axis: 'x', position: 120, start: 500, end: 650, label: '150' },
        ]
        artboard.append(iframe, overlay); clip.append(artboard)
    })
    const inside = page.locator('[data-guide-label-id=inside]'), outside = page.locator('[data-guide-label-id=outside]')
    await contained(page, 2)
    await expect(inside).toBeVisible()
    await expect(outside).toHaveCSS('visibility', 'hidden')
    await page.locator('#clip').evaluate(node => node.scrollTo(400, 0))
    await contained(page, 2)
    await expect(inside).toHaveCSS('visibility', 'hidden')
    await expect(outside).toBeVisible()
})
