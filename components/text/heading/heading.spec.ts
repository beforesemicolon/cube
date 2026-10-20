import { expect } from '@playwright/test'
import type { Heading } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-heading', 'text--heading', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release heading","description":"Release description"} satisfies Partial<Heading>) })
    await expect(host.getByRole('heading', { name: 'Release heading' })).toBeVisible()
    await expect(host.getByText('Release description', { exact: true })).toBeVisible()
})
