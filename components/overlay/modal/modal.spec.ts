import { expect } from '@playwright/test'
import type { Modal } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-modal', 'overlay--modal', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<Modal>) })
    await expect(host.locator('dialog')).toBeVisible()
})
