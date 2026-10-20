import { expect } from '@playwright/test'
import type { Checkbox } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-checkbox', 'form--checkbox', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"checked":true} satisfies Partial<Checkbox>) })
    await expect(host.locator('input[type=checkbox]')).toBeChecked()
})
