import { expect } from '@playwright/test'
import type { Badge } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-badge', 'data-display--badge', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { value: 'Release badge', tone: 'success', size: 'lg' } satisfies Partial<Badge>) })
    await expect(host.locator("[part~=display]")).toHaveText("Release badge")
    await expect(host.locator('[part~=badge]')).toHaveAttribute('data-tone', 'success')
    await expect(host.locator('[part~=badge]')).toHaveCSS('min-height', '28px')
    await host.evaluate(node => { node.textContent = 'Slotted status' })
    await expect(host.getByText('Slotted status')).toBeVisible()
})
