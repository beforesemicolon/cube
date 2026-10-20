import { expect } from '@playwright/test'
import type { Icon } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-icon', 'icons--icon', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { label: '', accessibleLabel: '' } satisfies Partial<Icon>) })
    await expect(host.locator("svg")).toHaveAttribute("aria-hidden", "true")
})
