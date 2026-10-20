import { expect } from '@playwright/test'
import type { CommandPalette } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-command-palette', 'overlay--command-palette', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<CommandPalette>) })
    await expect(host.locator('dialog')).toBeVisible()
})
