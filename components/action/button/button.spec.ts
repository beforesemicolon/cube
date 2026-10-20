import { expect } from '@playwright/test'
import type { Button } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-button', 'action--button', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"label":"Release action","loading":true} satisfies Partial<Button>) })
    await expect(host.getByRole('button', { name: 'Release action' })).toBeDisabled()
})
