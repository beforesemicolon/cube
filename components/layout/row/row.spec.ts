import { expect } from '@playwright/test'
import type { Row } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-row', 'layout--row', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"reverse":true} satisfies Partial<Row>) })
    await expect(host).toHaveCSS("flex-direction", "row-reverse")
})
