import { expect } from '@playwright/test'
import type { Breadcrumb } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-breadcrumb', 'navigation--breadcrumb', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release crumb"}]} satisfies Partial<Breadcrumb>) })
    await expect(host.getByText("Release crumb", { exact: true }).first()).toBeVisible()
})
