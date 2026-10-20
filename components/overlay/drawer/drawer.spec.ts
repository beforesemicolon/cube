import { expect } from '@playwright/test'
import type { Drawer } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-drawer', 'overlay--drawer', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<Drawer>) })
    await expect(host.locator('dialog')).toBeVisible()
})
