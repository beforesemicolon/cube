import { expect, test } from '@playwright/test'
import type { RangeInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-range-input', 'form--range-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42,"min":0,"max":100} satisfies Partial<RangeInput>) })
    await expect(host.locator("input[type=range]").first()).toHaveValue("42")
})

test('the Range Input Playground toggles to two handles without a separate story', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/?path=/story/form--range-input')
    const host = page.frameLocator('#storybook-preview-iframe').locator('cb-range-input[data-story-component]')
    await expect(host.getByRole('slider')).toHaveCount(1)
    await page.locator('#control-variant').selectOption('double')
    const from = host.getByRole('slider', { name: 'Minimum', exact: true })
    const to = host.getByRole('slider', { name: 'Maximum', exact: true })
    await expect(from).toHaveValue('25')
    await expect(to).toHaveValue('75')
    await from.press('ArrowRight')
    await expect(from).toHaveValue('26')
    await expect(to).toHaveValue('75')
})
