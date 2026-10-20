import { expect } from '@playwright/test'
import type { LayerTree } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-layer-tree', 'data-display--layer-tree', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release layer"}],"expandedIds":[]} satisfies Partial<LayerTree>) })
    await expect(host.getByText("Release layer", { exact: true }).first()).toBeVisible()
})
