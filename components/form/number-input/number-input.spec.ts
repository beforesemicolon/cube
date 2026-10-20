import { expect } from '@playwright/test'
import type { NumberInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-number-input', 'form--number-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42} satisfies Partial<NumberInput>) })
    await expect(host.locator("input[type=number]").first()).toHaveValue("42")
})
