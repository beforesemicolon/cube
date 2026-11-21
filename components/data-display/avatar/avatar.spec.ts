import { expect } from '@playwright/test'
import type { Avatar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-avatar', 'data-display--avatar', async ({ host }) => {
    const surface = host.locator('[part~=surface]')
    await expect(surface).toHaveCSS('border-radius', '50%')
    await host.evaluate(node => { Object.assign(node, { name: 'Release User', src: '', initials: '', size: 'tiny' } satisfies Partial<Avatar>) })
    await expect(host.locator('[part~=initials]')).toHaveAttribute('data-initials', 'RU')
    await expect(host.locator('[part~=initials]')).toBeVisible()
    await expect(host).toHaveCSS('width', '20px')
    await host.evaluate(node => node.setAttribute('variant', 'boxy'))
    await expect(host.locator('[part~=avatar]')).toHaveAttribute('data-variant', 'boxy')
    await expect.poll(() => surface.evaluate(element => {
        const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)
        return radius > 0 && radius < element.getBoundingClientRect().width / 2
    })).toBe(true)
    await host.evaluate(node => node.style.setProperty('--component-avatar-radius', '4px'))
    await expect(surface).toHaveCSS('border-radius', '4px')
    await host.evaluate(node => { Object.assign(node, { variant: 'round' } satisfies Partial<Avatar>) })
    await expect(surface).toHaveCSS('border-radius', '50%')
    const firstIndex = await host.locator('[part~=avatar]').getAttribute('data-color-index')
    await host.evaluate(node => { (node as Avatar).name = 'Release User' })
    await expect(host.locator('[part~=avatar]')).toHaveAttribute('data-color-index', firstIndex ?? '')
    await host.evaluate(node => { (node as Avatar).color = 'rgb(1, 2, 3)' })
    await expect(host.locator('[part~=surface]')).toHaveCSS('background-color', 'rgb(1, 2, 3)')
    await host.evaluate(node => { (node as Avatar).size = 'xl' })
    await expect(host).toHaveCSS('width', '64px')
})
