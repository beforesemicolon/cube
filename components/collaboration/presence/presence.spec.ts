import { expect } from '@playwright/test'
import type { Presence } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-presence', 'collaboration--presence', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"maxVisible":1} satisfies Partial<Presence>) })
    await expect(host.locator('[part~=overflow-avatar] [part~=initials]')).toHaveAttribute('data-initials', '+4')
    await expect(host.getByRole('button', { name: '4 more participants', exact: true })).toBeVisible()
})
