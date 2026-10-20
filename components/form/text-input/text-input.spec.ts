import { expect } from '@playwright/test'
import type { TextInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-text-input', 'form--text-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"Release text"} satisfies Partial<TextInput>) })
    await expect(host.locator("input:not([type=hidden])").first()).toHaveValue("Release text")
})
