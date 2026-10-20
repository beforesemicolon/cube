import { expect } from '@playwright/test'
import type { Switch } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-switch', 'form--switch', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"checked":true} satisfies Partial<Switch>) })
    await expect(host.locator('input[type=checkbox]')).toBeChecked()
})
