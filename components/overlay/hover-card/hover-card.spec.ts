import { expect } from '@playwright/test'
import type { HoverCard } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-hover-card', 'overlay--hover-card', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<HoverCard>) })
    await expect(host.locator('[part~=panel]')).toBeVisible()
})
