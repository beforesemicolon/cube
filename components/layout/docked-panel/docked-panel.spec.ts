import { expect } from '@playwright/test'
import type { DockedPanel } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-docked-panel', 'layout--docked-panel', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release panel"} satisfies Partial<DockedPanel>) })
    await expect(host.getByText("Release panel", { exact: true }).first()).toBeVisible()
})
