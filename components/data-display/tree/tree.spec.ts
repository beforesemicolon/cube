import { expect } from '@playwright/test'
import type { Tree } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tree', 'data-display--tree', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release branch"}]} satisfies Partial<Tree>) })
    await expect(host.getByText("Release branch", { exact: true }).first()).toBeVisible()
})
