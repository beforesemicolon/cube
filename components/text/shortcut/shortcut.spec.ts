import { expect } from '@playwright/test'
import type { Shortcut } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-shortcut', 'text--shortcut', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"keys":"Ctrl+Shift+S"} satisfies Partial<Shortcut>) })
    await expect(host.locator("kbd")).toHaveText(["Ctrl","Shift","S"])
})
