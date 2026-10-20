import { expect } from '@playwright/test'
import type { TokenInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-token-input', 'form--token-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release token"}]} satisfies Partial<TokenInput>) })
    await expect(host.getByText("Release token", { exact: true }).first()).toBeVisible()
})
