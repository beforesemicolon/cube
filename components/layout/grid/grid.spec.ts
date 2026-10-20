import { expect } from '@playwright/test'
import type { Grid } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-grid', 'layout--grid', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"gap":"20px"} satisfies Partial<Grid>) })
    await expect(host).toHaveCSS("gap", "20px")
})
