import { expect } from '@playwright/test'
import type { ButtonGroup } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-button-group', 'action--button-group', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { items: [{ id: 'release', label: 'Release action' }], variant: 'primary' } satisfies Partial<ButtonGroup>) })
    await expect(host.getByRole('button', { name: 'Release action', exact: true })).toBeVisible()
    await expect(host.locator('cb-button')).toHaveAttribute('variant', 'primary')
})
