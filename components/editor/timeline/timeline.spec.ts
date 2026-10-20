import { expect } from '@playwright/test'
import type { Timeline } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-timeline', 'editor--timeline', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"duration":2000,"currentTime":500} satisfies Partial<Timeline>) })
    await expect(host.locator("[part=ruler]")).toHaveAttribute("aria-valuenow", "500")
})
