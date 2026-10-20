import { expect } from '@playwright/test'
import type { CodeEditor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-code-editor', 'form--code-editor', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"const release = true"} satisfies Partial<CodeEditor>) })
    await expect(host.locator("textarea").first()).toHaveValue("const release = true")
})
