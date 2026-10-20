import { expect } from '@playwright/test'
import type { Badge } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-badge', 'data-display--badge', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"Release badge"} satisfies Partial<Badge>) })
    await expect(host.locator("[part~=display]")).toHaveText("Release badge")
})
