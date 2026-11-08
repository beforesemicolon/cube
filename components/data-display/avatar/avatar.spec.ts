import { expect } from '@playwright/test'
import type { Avatar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-avatar', 'data-display--avatar', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { name: 'Release User', src: '', initials: '', size: 'tiny' } satisfies Partial<Avatar>) })
    await expect(host.locator('[part~=initials]')).toHaveAttribute('data-initials', 'RU')
    await expect(host.locator('[part~=initials]')).toBeVisible()
    await expect(host).toHaveCSS('width', '20px')
    const firstIndex = await host.locator('[part~=avatar]').getAttribute('data-color-index')
    await host.evaluate(node => { (node as Avatar).name = 'Release User' })
    await expect(host.locator('[part~=avatar]')).toHaveAttribute('data-color-index', firstIndex ?? '')
    await host.evaluate(node => { (node as Avatar).color = 'rgb(1, 2, 3)' })
    await expect(host.locator('[part~=surface]')).toHaveCSS('background-color', 'rgb(1, 2, 3)')
    await host.evaluate(node => { (node as Avatar).size = 'xl' })
    await expect(host).toHaveCSS('width', '64px')
})
