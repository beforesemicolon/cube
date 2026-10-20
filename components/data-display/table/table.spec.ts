import { expect } from '@playwright/test'
import type { Table } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-table', 'data-display--table', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","name":"Release row","status":"Draft","owner":"Owner","updated":"Now"}],"expandedKeys":[],"selectedKeys":[]} satisfies Partial<Table>) })
    await expect(host.getByText("Release row", { exact: true }).first()).toBeVisible()
})
