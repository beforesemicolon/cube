import { expect } from '@playwright/test'
import type { Col } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-col', 'layout--col', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"reverse":true} satisfies Partial<Col>) })
    await expect(host).toHaveCSS("flex-direction", "column-reverse")
})
