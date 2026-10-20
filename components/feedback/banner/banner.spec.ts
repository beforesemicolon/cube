import { expect } from '@playwright/test'
import type { Banner } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-banner', 'feedback--banner', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release message"} satisfies Partial<Banner>) })
    await expect(host.locator("[part~=status-title]")).toHaveText("Release message")
})
