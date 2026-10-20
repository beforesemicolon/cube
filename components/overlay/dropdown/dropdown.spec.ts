import { expect } from '@playwright/test'
import type { Dropdown } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-dropdown', 'overlay--dropdown', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<Dropdown>) })
    await expect(host.locator('[part=popup]')).toBeVisible()
})
