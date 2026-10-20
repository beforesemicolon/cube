import { expect } from '@playwright/test'
import type { Combobox } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-combobox', 'form--combobox', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"inter"} satisfies Partial<Combobox>) })
    await expect(host.locator("input[part=input]").first()).toHaveValue("Inter")
})
