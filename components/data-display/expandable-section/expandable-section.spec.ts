import { expect } from '@playwright/test'
import type { ExpandableSection } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-expandable-section', 'data-display--expandable-section', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"expanded":true} satisfies Partial<ExpandableSection>) })
    await expect(host.locator('[part~=panel]')).toBeVisible()
})
