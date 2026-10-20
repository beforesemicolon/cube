import { expect } from '@playwright/test'
import type { Status } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-status', 'feedback--status', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { value: 'Release message' } satisfies Partial<Status>) })
    await expect(host.locator("[part~=status-title]")).toHaveText("Release message")
})
