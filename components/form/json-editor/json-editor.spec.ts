import { expect } from '@playwright/test'
import type { JsonEditor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-json-editor', 'form--json-editor', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"{\"release\":true}"} satisfies Partial<JsonEditor>) })
    await expect(host.locator("textarea").first()).toHaveValue("{\"release\":true}")
})
