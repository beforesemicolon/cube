import { expect } from '@playwright/test'
import type { BottomSheet } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-bottom-sheet', 'overlay--bottom-sheet', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<BottomSheet>) })
    await expect(host.locator('dialog')).toBeVisible()
})
