import { expect } from '@playwright/test'
import type { Toolbar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-toolbar', 'layout--toolbar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"accessibleLabel":"Release toolbar"} satisfies Partial<Toolbar>) })
    await expect(host.locator("[part=toolbar]")).toHaveAttribute("aria-label", "Release toolbar")
})
