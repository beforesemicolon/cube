import { expect } from '@playwright/test'
import type { Select } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-select', 'form--select', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"native":true,"options":[{"value":"release","label":"Release choice"}],"value":"release"} satisfies Partial<Select>) })
    await expect(host.locator("select").first()).toHaveValue("release")
})
