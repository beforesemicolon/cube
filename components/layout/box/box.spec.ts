import { expect } from '@playwright/test'
import type { Box } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-box', 'layout--box', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"padding":"20px"} satisfies Partial<Box>) })
    await expect(host).toHaveCSS("padding-top", "20px")

    await host.evaluate(node => {
        Object.assign(node, {
            padding: 'md 0',
            margin: 'xs',
        } satisfies Partial<Box>)
    })
    await expect(host).toHaveCSS('padding-top', '12px')
    await expect(host).toHaveCSS('padding-right', '0px')
    await expect(host).toHaveCSS('padding-bottom', '12px')
    await expect(host).toHaveCSS('padding-left', '0px')
    await expect(host).toHaveCSS('margin-top', '4px')
})
