import { expect } from '@playwright/test'
import type { CodePreview } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-code-preview', 'data-display--code-preview', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"code":"const release = true","codeLanguage":"javascript"} satisfies Partial<CodePreview>) })
    await expect(host.locator("code")).toHaveText("const release = true")
})
