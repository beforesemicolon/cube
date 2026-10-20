import { expect } from '@playwright/test'
import type { RemoteCursor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-remote-cursor', 'collaboration--remote-cursor', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"accessibleLabel":"Release marker"} satisfies Partial<RemoteCursor>) })
    await expect(host.locator("[role=region]")).toHaveAttribute("aria-label", "Release marker")
})
