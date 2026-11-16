import { expect, test } from '@playwright/test'

test('default Storybook choices use medium dimensions beside the text field', async ({ page }) => {
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
    expect(heights[0]).toBeGreaterThan(28)
    expect(heights.slice(1)).toEqual([36, 36])
})

test('checkbox and radio indicators use medium defaults and honor explicit sizes', async ({ page }) => {
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
        const expectedInputHeight = await row.locator('cb-text-input input').evaluate(node => {
            const style = getComputedStyle(node)
            const content = Number.parseFloat(style.lineHeight)
            const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
            const border = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
            return Math.max(38, Number.parseFloat(style.getPropertyValue('--cb-height')), content + padding + border)
        })
        expect(input.height).toBeCloseTo(expectedInputHeight, 1)
        const height = await row.locator('cb-text-input').evaluate(node => Number.parseFloat(getComputedStyle(node).getPropertyValue('--cb-height')))
        for (const tag of ['cb-checkbox', 'cb-radio', 'cb-radio-group']) {
            const indicator = row.locator(`${tag} input`)
            await expect(indicator).toBeChecked()
            const bounds = (await indicator.boundingBox())!
            expect(bounds.height).toBe(height)
            expect(bounds.width).toBe(height)
            // Fields grow with their padding; choices retain the requested square size.
            expect(bounds.height).toBeLessThanOrEqual(input.height)
            expect(bounds.y + bounds.height / 2).toBeCloseTo(input.y + input.height / 2, 0)
        }
    }
    await page.screenshot({ path: '/tmp/cube-choice-sizing.png' })
})
