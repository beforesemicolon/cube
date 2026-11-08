import { expect } from '@playwright/test'
import type { CartesianChart } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-cartesian-chart', 'charts--bar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { heading: 'Release chart', legendLabel: '', messages: { legendLabel: 'Release series', tableLabel: 'Release data' } } satisfies Partial<CartesianChart>) })
    await expect(host.getByText("Release chart", { exact: true }).first()).toBeVisible()
    await expect(host.locator('[part~=legend]')).toHaveAttribute('aria-label', 'Release series')
})
