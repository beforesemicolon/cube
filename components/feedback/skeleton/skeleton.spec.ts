import { expect } from '@playwright/test'
import type { Skeleton } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-skeleton', 'feedback--skeleton', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"variant":"text","lines":5} satisfies Partial<Skeleton>) })
    await expect(host.locator("[part~=line]")).toHaveCount(5)
})
