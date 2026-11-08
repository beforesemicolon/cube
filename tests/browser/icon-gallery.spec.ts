import { expect, test } from '@playwright/test'
import { iconPaths } from '../../components/icons/registry.js'

for (const appearance of ['light', 'dark']) {
    test(`icon gallery shows every registered icon with its name (${appearance})`, async ({ page }) => {
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=examples--icon-gallery&viewMode=story&globals=appearance:${appearance}`)
        const grid = page.locator('cb-grid[aria-label="All icons"]')
        const names = Object.keys(iconPaths).sort()
        await expect(grid.locator('cb-icon')).toHaveCount(names.length, { timeout: 20_000 })
        expect(await grid.locator('cb-icon').evaluateAll(nodes => nodes.map(node => node.getAttribute('name')))).toEqual(names)
        await expect(grid.locator('code')).toHaveText(names)
        expect(await grid.locator('cb-icon path').evaluateAll(nodes => nodes.every(node => Boolean(node.getAttribute('d'))))).toBe(true)
        await page.screenshot({ path: `/tmp/cube-icon-gallery-${appearance}.png` })
        await page.setViewportSize({ width: 360, height: 800 })
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    })
}
