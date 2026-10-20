import { expect } from '@playwright/test'
import type { Tabs } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tabs', 'navigation--tabs', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release tab"}],"value":"release"} satisfies Partial<Tabs>) })
    await expect(host.getByRole('tab', { name: 'Release tab', exact: true })).toHaveAttribute('aria-selected', 'true')
})
