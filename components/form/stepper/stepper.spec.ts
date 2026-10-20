import { expect } from '@playwright/test'
import type { Stepper } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-stepper', 'form--stepper', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":42} satisfies Partial<Stepper>) })
    await expect(host.locator("input[type=number]").first()).toHaveValue("42")
})
