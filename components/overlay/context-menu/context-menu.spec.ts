import { expect } from '@playwright/test'
import type { ContextMenu } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-context-menu', 'overlay--context-menu', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<ContextMenu>) })
    await expect(host.getByRole('menu')).toBeVisible()
})
