import { expect } from '@playwright/test'
import type { Sidebar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-sidebar', 'layout--sidebar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"collapsible":true,"expanded":false} satisfies Partial<Sidebar>) })
    await expect(host).toHaveCSS("width", "48px")
})
