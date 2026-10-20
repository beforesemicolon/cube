import { expect } from '@playwright/test'
import type { Spinner } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-spinner', 'feedback--spinner', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { label: 'Release loading', status: '' } satisfies Partial<Spinner>) })
    await expect(host.locator("[part~=status-title]")).toHaveText("Release loading")
})
