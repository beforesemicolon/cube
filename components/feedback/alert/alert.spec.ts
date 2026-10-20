import { expect } from '@playwright/test'
import type { Alert } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-alert', 'feedback--alert', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release message"} satisfies Partial<Alert>) })
    await expect(host.locator("[part~=status-title]")).toHaveText("Release message")
})
