import { expect } from '@playwright/test'
import type { List } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-list', 'data-display--list', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":["Release row"]} satisfies Partial<List>) })
    await expect(host.locator("[part=item]")).toHaveText("Release row")
})
