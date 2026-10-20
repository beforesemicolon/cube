import { expect } from '@playwright/test'
import type { Accordion } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-accordion', 'data-display--accordion', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release settings","content":"Release contents"}],"expandedIds":["release"]} satisfies Partial<Accordion>) })
    await expect(host.getByText("Release contents", { exact: true }).first()).toBeVisible()
})
