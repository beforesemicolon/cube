import { expect } from '@playwright/test'
import type { Avatar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-avatar', 'data-display--avatar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"name":"Release User","src":"","initials":""} satisfies Partial<Avatar>) })
    await expect(host.locator('[part~=initials]')).toHaveAttribute('data-initials', 'RU')
    await expect(host.locator('[part~=initials]')).toBeVisible()
})
