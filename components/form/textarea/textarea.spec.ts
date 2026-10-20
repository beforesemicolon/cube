import { expect } from '@playwright/test'
import type { Textarea } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-textarea', 'form--textarea', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"Release body"} satisfies Partial<Textarea>) })
    await expect(host.locator("textarea").first()).toHaveValue("Release body")
})
