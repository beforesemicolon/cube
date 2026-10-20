import { expect } from '@playwright/test'
import type { Progress } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-progress', 'feedback--progress', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"progress":75} satisfies Partial<Progress>) })
    await expect(host.getByRole('progressbar')).toHaveJSProperty('value', 75)
})
