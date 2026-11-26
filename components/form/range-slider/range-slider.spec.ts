import { expect, test } from '@playwright/test'
import type { RangeSlider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-range-slider', 'form--range-slider', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42,"min":0,"max":100} satisfies Partial<RangeSlider>) })
    await expect(host.locator("input[type=range]").first()).toHaveValue("42")
})

test('the Double Range Slider Playground story exposes and moves both handles', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=form--range-slider-double&viewMode=story')
    const host = page.locator('cb-range-slider[data-story-component]')
    const from = host.getByRole('slider', { name: 'Minimum price', exact: true })
    const to = host.getByRole('slider', { name: 'Maximum price', exact: true })
    await expect(from).toHaveValue('25')
    await expect(to).toHaveValue('75')
    await from.press('ArrowRight')
    await expect(from).toHaveValue('30')
    await expect(to).toHaveValue('75')
})
