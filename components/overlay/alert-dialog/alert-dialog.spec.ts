import { expect } from '@playwright/test'
import type { AlertDialog } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-alert-dialog', 'overlay--alert-dialog', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<AlertDialog>) })
    await expect(host.locator('dialog')).toBeVisible()
})
