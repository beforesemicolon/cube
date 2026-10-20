import { expect } from '@playwright/test'
import type { SplitButton } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-split-button', 'action--split-button', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release action","loading":true} satisfies Partial<SplitButton>) })
    await expect(host.locator('cb-button[part=primary]').getByRole('button')).toBeDisabled()
})
