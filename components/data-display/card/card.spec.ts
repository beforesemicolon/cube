import { expect } from '@playwright/test'
import type { Card } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-card', 'data-display--card', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"padding":"24px"} satisfies Partial<Card>) })
    await expect(host).toHaveCSS("padding-top", "24px")
})
