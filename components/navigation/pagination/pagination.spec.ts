import { expect } from '@playwright/test'
import type { Pagination } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-pagination', 'navigation--pagination', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"totalPages":3,"page":2} satisfies Partial<Pagination>) })
    await expect(host.locator("[aria-current=page]")).toHaveText("2")
})
