import { expect } from '@playwright/test'
import type { Flashbar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-flashbar', 'feedback--flashbar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"messages":[{"id":"release","title":"Release flash","message":"Release body","duration":0}]} satisfies Partial<Flashbar>) })
    await expect(host.getByText("Release flash", { exact: true }).first()).toBeVisible()
})
