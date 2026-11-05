import { expect, test } from '@playwright/test'
import type { Viewport } from '../../components/editor/viewport/index.js'

test('top-center slot is fixed above the pan surface, contains input, and hides when empty', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => !!customElements.get('cb-viewport'))
    await page.evaluate(() => {
        const viewport = document.createElement('cb-viewport') as Viewport
        viewport.style.cssText = 'width:600px;--component-viewport-height:400px'
        Object.assign(viewport, { zoom: 80, x: 12, y: -10, panTool: true })
        document.querySelector('#fixture')!.append(viewport)
    })
    const viewport = page.locator('cb-viewport'), slot = viewport.locator('[part~=top-center]')
    await expect(slot).toBeHidden()
    await viewport.evaluate(node => {
        const button = document.createElement('button'); button.slot = 'top-center'; button.textContent = 'Consumer controls'
        button.addEventListener('click', () => { button.dataset.clicked = 'yes' })
        node.append(button)
    })
    await expect(slot).toBeVisible()
    const button = viewport.getByRole('button', { name: 'Consumer controls', exact: true })
    const before = (await button.boundingBox())!
    await viewport.evaluate((node: Viewport) => node.setViewport(150, 80, -90))
    const after = (await button.boundingBox())!
    expect(Math.abs(after.x - before.x)).toBeLessThan(1); expect(Math.abs(after.y - before.y)).toBeLessThan(1)
    await button.click(); await expect(button).toHaveAttribute('data-clicked', 'yes')
    await button.dispatchEvent('wheel', { deltaY: 200, bubbles: true, composed: true })
    await button.press('ArrowRight')
    await expect(viewport).toHaveJSProperty('x', 80); await expect(viewport).toHaveJSProperty('y', -90); await expect(viewport).toHaveJSProperty('zoom', 150)
    await button.evaluate(node => node.remove()); await expect(slot).toBeHidden()
})
