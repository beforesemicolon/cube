import { expect } from '@playwright/test'
import type { PropertyGroup } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-property-group', 'editor--property-group', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"mixed":true,"mixedLabel":"Release mixed"} satisfies Partial<PropertyGroup>) })
    await expect(host.getByText("Release mixed", { exact: true }).first()).toBeVisible()
})
