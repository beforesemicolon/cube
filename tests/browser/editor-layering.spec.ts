import { expect, test, type Page } from '@playwright/test'
import type { GuideOverlay } from '../../components/editor/guide-overlay/index.js'
import type { SelectionOverlay } from '../../components/editor/selection-overlay/index.js'
import type { MarqueeSelection } from '../../components/editor/marquee-selection/index.js'
import type { Artboard } from '../../components/editor/artboard/index.js'

async function colorsAt(page: Page, points: readonly { x: number; y: number }[]): Promise<number[][]> {
    const png = (await page.screenshot({ scale: 'css' })).toString('base64')
    return page.evaluate(async ({ png, points }) => {
        const image = new Image()
        image.src = `data:image/png;base64,${png}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width; canvas.height = image.height
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        return points.map(point => [...context.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1).data])
    }, { png, points })
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-guide-overlay')))
})

test('labels paint above crossing selection borders; all indicators paint above iframe content', async ({ page }) => {
    await page.evaluate(() => {
        const stage = document.createElement('div')
        stage.id = 'stage'
        stage.style.cssText = 'position:relative;isolation:isolate;width:320px;height:220px;overflow:hidden;--z-index-selection:200'
        const iframe = document.createElement('iframe')
        iframe.title = 'Page content'
        iframe.style.cssText = 'position:relative;z-index:0;width:100%;height:100%;border:0'
        iframe.srcdoc = '<style>body{margin:0;background:rgb(0,255,0)}div{position:fixed;inset:0;z-index:2147483647;background:rgb(0,255,0)}</style><div>Content</div>'
        const guide = document.createElement('cb-guide-overlay') as GuideOverlay
        guide.guides = [{ id: 'distance', axis: 'x', position: 100, start: 0, end: 59, label: '59' }]
        const selection = document.createElement('cb-selection-overlay') as SelectionOverlay
        Object.assign(selection, { rect: { x: 24, y: 30, width: 272, height: 160 }, movable: false, resizable: false, rotatable: false, showSize: false })
        const marquee = document.createElement('cb-marquee-selection') as MarqueeSelection
        const style = document.createElement('style')
        style.textContent = 'cb-guide-overlay::part(label){background:rgb(0,0,255)}cb-guide-overlay::part(line){background:rgb(255,255,0)}cb-selection-overlay::part(selection){border:3px solid rgb(255,0,0)}cb-marquee-selection::part(marquee){background:rgb(255,0,255);border-color:rgb(255,0,255)}'
        document.head.append(style)
        stage.append(iframe, guide, selection, marquee)
        document.querySelector('#fixture')!.append(stage)
    })
    const label = page.locator('[data-guide-label-id=distance]')
    await expect(label).toBeVisible()
    await expect(page.locator('iframe').contentFrame().locator('body')).toHaveCSS('background-color', 'rgb(0, 255, 0)')
    await page.locator('cb-marquee-selection').evaluate(node => {
        const marquee = node as MarqueeSelection
        marquee.begin({ x: 60, y: 140 }); marquee.updateSelection({ x: 140, y: 180 })
    })
    await expect(page.locator('cb-marquee-selection [part~=marquee]')).toBeVisible()
    const stage = (await page.locator('#stage').boundingBox())!, box = (await label.boundingBox())!
    expect(await colorsAt(page, [
        { x: stage.x + 25, y: box.y + 1 }, // Selection border passes directly through label padding.
        { x: stage.x + 25, y: stage.y + 50 },
        { x: stage.x + 50, y: stage.y + 100 },
        { x: stage.x + 70, y: stage.y + 150 },
    ])).toEqual([[0, 0, 255, 255], [255, 0, 0, 255], [255, 255, 0, 255], [255, 0, 255, 255]])
    await expect(label).toHaveCSS('pointer-events', 'none')
    await expect(page.locator('cb-selection-overlay')).toHaveCSS('pointer-events', 'none')
})

test('native artboard chrome stays above consumer content even with a maximum z-index', async ({ page }) => {
    await page.evaluate(() => {
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, { width: 320, height: 220, name: 'Page', editable: false, guidesEnabled: true, showGuides: true,
            guideLabel: 'Guide {id}', guideDistanceLabel: '59', guides: [{ id: 'distance', axis: 'x', position: 80 }] })
        const content = document.createElement('div')
        content.style.cssText = 'position:relative;z-index:2147483647;width:320px;height:220px;background:rgb(0,255,0)'
        const style = document.createElement('style')
        style.textContent = 'cb-guide-overlay::part(label){background:rgb(0,0,255)}cb-guide-overlay::part(line){background:rgb(255,255,0)}'
        document.head.append(style)
        board.append(content); document.querySelector('#fixture')!.append(board)
    })
    await page.getByRole('slider', { name: 'Guide distance', exact: true }).hover()
    const label = page.locator('cb-guide-overlay [part~=label]')
    await expect(label).toBeVisible()
    const box = (await label.boundingBox())!
    const background = await label.evaluate(node => getComputedStyle(node).backgroundColor)
    const [pixel] = await colorsAt(page, [{ x: box.x + 5, y: box.y + 1 }])
    expect(`rgb(${pixel.slice(0, 3).join(', ')})`).toBe(background)
    await expect(page.locator('cb-artboard [part~=content-viewport]')).toHaveCSS('isolation', 'isolate')
})
