import { expect, test } from '@playwright/test'
import type { FileBrowser } from '../../components/data-display/file-browser/index.js'

for (const appearance of ['light','dark']) for (const width of [1100,360]) {
    test(`file-browser icon previews fill their tile and center glyphs (${appearance}, ${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=data-display--file-browser&viewMode=story&globals=appearance:${appearance}`)
        const browser = page.locator('cb-file-browser[data-story-component]')
        await expect(browser.locator('[part~=entry]')).toHaveCount(4)
        for (const entry of await browser.locator('[part~=entry]').all()) {
            const preview = entry.locator('[part~=entry-preview]')
            const svg = entry.locator('cb-icon svg')
            await expect(preview).toHaveCSS('min-height','80px')
            await expect(svg).toHaveCSS('width','32px')
            await expect(svg).toHaveCSS('height','32px')
            const [tileBounds, previewBounds, iconBounds] = await Promise.all([entry.boundingBox(), preview.boundingBox(), svg.boundingBox()])
            if (!tileBounds || !previewBounds || !iconBounds) throw new Error('Missing file tile bounds')
            expect(previewBounds.width).toBeGreaterThan(tileBounds.width - 24)
            expect(previewBounds.height).toBeGreaterThanOrEqual(80)
            expect(iconBounds.x + iconBounds.width / 2).toBeCloseTo(previewBounds.x + previewBounds.width / 2, 0)
            expect(iconBounds.y + iconBounds.height / 2).toBeCloseTo(previewBounds.y + previewBounds.height / 2, 0)
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    })
}

test('a tall thumbnail fills the preview without inflating every tile in the row', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 })
    await page.route('**/file-browser-thumbnail.png', route => route.fulfill({ path: 'design/figma-layers/Studio/05/Data & feedback.png' }))
    await page.goto('http://127.0.0.1:6006/iframe.html?id=data-display--file-browser&viewMode=story')
    const browser = page.locator('cb-file-browser[data-story-component]')
    await expect(browser.locator('[part~=entry]')).toHaveCount(4)
    await browser.evaluate(node => {
        const browser = node as FileBrowser
        browser.entries = browser.entries.map(entry => entry.id === 'logo' ? { ...entry, thumbnail: '/file-browser-thumbnail.png' } : entry)
    })
    const image = browser.locator('[part~=entry-preview] img')
    await expect(image).toBeVisible()
    await image.evaluate((node: HTMLImageElement) => node.decode())
    await expect(image).toHaveCSS('object-fit','cover')
    for (const preview of await browser.locator('[part~=entry-preview]').all()) await expect(preview).toHaveCSS('height','80px')
    for (const entry of await browser.locator('[part~=entry]').all()) expect((await entry.boundingBox())?.height).toBeLessThan(160)
})
