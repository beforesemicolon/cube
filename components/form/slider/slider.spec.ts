import { expect } from '@playwright/test'
import type { Slider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-slider', 'form--slider', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42,"min":0,"max":100} satisfies Partial<Slider>) })
    await expect(host.locator("input[type=range]").first()).toHaveValue("42")
})
