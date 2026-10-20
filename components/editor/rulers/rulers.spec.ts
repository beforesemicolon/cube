import { expect } from '@playwright/test'
import type { Rulers } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-rulers', 'editor--rulers', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"unit":"rem"} satisfies Partial<Rulers>) })
    await expect(host.locator('[part=tick-label]').first()).toHaveText(/rem$/)
})
