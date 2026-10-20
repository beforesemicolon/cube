import { expect } from '@playwright/test'
import type { GuideOverlay } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-guide-overlay', 'editor--guide-overlay', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"guides":[{"id":"release","axis":"x","position":50,"start":0,"end":100,"label":"Release guide","type":"snap"}]} satisfies Partial<GuideOverlay>) })
    await expect(host.locator("[part=label]")).toHaveText("Release guide")
})
