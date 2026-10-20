import { expect } from '@playwright/test'
import type { Box } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-box', 'layout--box', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"padding":"20px"} satisfies Partial<Box>) })
    await expect(host).toHaveCSS("padding-top", "20px")
})
