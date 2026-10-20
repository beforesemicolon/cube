import { expect } from '@playwright/test'
import type { Tooltip } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tooltip', 'overlay--tooltip', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true,"content":"Release tooltip"} satisfies Partial<Tooltip>) })
    await expect(host.getByRole('tooltip')).toContainText('Release tooltip')
})
