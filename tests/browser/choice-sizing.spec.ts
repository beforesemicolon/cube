import { expect, test } from '@playwright/test'

test('default Storybook choices use compact dimensions beside the text field', async ({ page }) => {
    const heights: number[] = []
    for (const [story, tag, selector] of [
        ['text-input', 'cb-text-input', 'input'],
        ['checkbox', 'cb-checkbox', 'input[type=checkbox]'],
        ['radio', 'cb-radio', 'input[type=radio]'],
    ]) {
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=form--${story}&viewMode=story`)
        const control = page.locator(`${tag}[data-story-component]`).locator(selector!)
        await expect(control).toBeVisible()
        heights.push((await control.boundingBox())!.height)
    }
    expect(heights).toEqual([28, 24, 24])
})

test('checkbox and radio indicators use compact defaults and honor explicit sizes', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-radio')))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')!
        for (const size of ['default', 'xs', 'sm', 'md', 'lg']) {
            const row = document.createElement('div')
            row.dataset.testSize = size
            row.style.cssText = 'display:flex;align-items:center;gap:12px;margin:16px'
            for (const tag of ['cb-text-input', 'cb-checkbox', 'cb-radio', 'cb-radio-group']) {
                const control = document.createElement(tag)
                Object.assign(control, { ...(size === 'default' ? {} : { size }), checked: true, value: tag === 'cb-text-input' ? size : 'one', options: [{ value: 'one', label: '' }] })
                row.append(control)
            }
            fixture.append(row)
        }
    })
    for (const size of ['default', 'xs', 'sm', 'md', 'lg']) {
        const row = page.locator(`[data-test-size=${size}]`)
        const input = (await row.locator('cb-text-input input').boundingBox())!
        const height = size === 'default' ? 24 : await row.locator('cb-text-input').evaluate(node => Number.parseFloat(getComputedStyle(node).getPropertyValue('--cb-height')))
        for (const tag of ['cb-checkbox', 'cb-radio', 'cb-radio-group']) {
            const indicator = row.locator(`${tag} input`)
            await expect(indicator).toBeChecked()
            const bounds = (await indicator.boundingBox())!
            expect(bounds.height).toBe(height)
            expect(bounds.width).toBe(height)
            // Native text padding can exceed the smallest height token by a few pixels.
            expect(Math.abs(bounds.height - input.height)).toBeLessThanOrEqual(size === 'default' ? 4 : 3)
            expect(bounds.y + bounds.height / 2).toBeCloseTo(input.y + input.height / 2, 0)
        }
    }
    await page.screenshot({ path: '/tmp/cube-choice-sizing.png' })
})
