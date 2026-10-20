import { expect } from '@playwright/test'
import type { Popover } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-popover', 'overlay--popover', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<Popover>) })
    await expect(host.locator('[part~=panel]')).toBeVisible()
})
