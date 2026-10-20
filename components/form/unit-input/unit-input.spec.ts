import { expect } from '@playwright/test'
import type { UnitInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-unit-input', 'form--unit-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42} satisfies Partial<UnitInput>) })
    await expect(host.locator("input[type=number]").first()).toHaveValue("42")
})
