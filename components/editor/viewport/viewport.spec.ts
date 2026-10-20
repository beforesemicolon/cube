import { expect } from '@playwright/test'
import type { Viewport } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-viewport', 'editor--viewport', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"zoom":125} satisfies Partial<Viewport>) })
    await expect(host.locator("[part=status]")).toHaveText("125%")
})
