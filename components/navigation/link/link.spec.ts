import { expect } from '@playwright/test'
import type { Link } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-link', 'navigation--link', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"href":"#release-target"} satisfies Partial<Link>) })
    await expect(host.locator("a")).toHaveAttribute("href", "#release-target")
})
