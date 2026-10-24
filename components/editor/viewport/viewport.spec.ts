import { expect } from '@playwright/test'
import type { Viewport } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-viewport', 'editor--viewport', async ({ host }) => {
    const surface = host.locator('[part~=viewport]')
    await expect(surface).not.toHaveAttribute('part', /\bcontrol\b/)
    await expect(surface).toHaveCSS('border-width', '1px')
    await expect(surface).toHaveCSS('border-radius', '0px')
    await expect(surface).toHaveCSS('padding', '0px')
    await host.evaluate(node => {
        node.style.setProperty('--radius-sm', '32px')
        node.style.setProperty('--radius-lg', '48px')
        node.style.setProperty('--spacing-xs', '16px')
        node.style.setProperty('--spacing-md', '24px')
    })
    await expect(surface).toHaveCSS('border-width', '1px')
    await expect(surface).toHaveCSS('border-radius', '0px')
    await expect(surface).toHaveCSS('padding', '0px')
    await host.evaluate(node => { Object.assign(node, {"zoom":125} satisfies Partial<Viewport>) })
    await expect(host.locator("[part=status]")).toHaveText("125%")
})
