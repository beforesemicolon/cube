import { expect } from '@playwright/test'
import type { Toast } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-toast', 'feedback--toast', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release message"} satisfies Partial<Toast>) })
    await expect(host.locator("[part~=status-title]")).toHaveText("Release message")
})
