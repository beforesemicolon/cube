import { expect } from '@playwright/test'
import type { PieChart } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-pie-chart', 'charts--pie', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"heading":"Release chart"} satisfies Partial<PieChart>) })
    await expect(host.getByText("Release chart", { exact: true }).first()).toBeVisible()
})
