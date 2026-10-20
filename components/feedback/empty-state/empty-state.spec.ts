import { expect } from '@playwright/test'
import type { EmptyState } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-empty-state', 'feedback--empty-state', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"heading":"Release empty"} satisfies Partial<EmptyState>) })
    await expect(host.getByRole('heading', { name: 'Release empty' })).toBeVisible()
})
