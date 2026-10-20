import { expect } from '@playwright/test'
import type { Bezier } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-bezier', 'editor--bezier', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"x1":0.5} satisfies Partial<Bezier>) })
    await expect(host.locator('[part=value]')).toContainText('0.5')
})
