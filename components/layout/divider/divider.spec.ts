import { expect } from '@playwright/test'
import type { Divider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-divider', 'layout--divider', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"stacked":true} satisfies Partial<Divider>) })
    await expect(host).toHaveCSS("width", "1px")
})
