import { expect } from '@playwright/test'
import type { Workspace } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-workspace', 'layout--workspace', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"bottomOpen":false} satisfies Partial<Workspace>) })
    await expect(host.locator('[part~=bottom-panel]')).toBeHidden()
})
