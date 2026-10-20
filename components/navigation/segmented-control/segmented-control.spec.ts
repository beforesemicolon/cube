import { expect } from '@playwright/test'
import type { SegmentedControl } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-segmented-control', 'navigation--segmented-control', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release choice"}],"value":"release"} satisfies Partial<SegmentedControl>) })
    await expect(host.getByRole('radio', { name: 'Release choice', exact: true })).toHaveAttribute('aria-checked', 'true')
})
