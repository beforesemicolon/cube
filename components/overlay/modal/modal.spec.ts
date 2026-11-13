import { expect } from '@playwright/test'
import type { Modal } from './index.js'
import type { Select } from '../../form/select/index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-modal', 'overlay--modal', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"open":true} satisfies Partial<Modal>) })
    await expect(host.locator('dialog')).toBeVisible()
    await expect(host.locator('dialog')).toHaveCSS('width', '500px')
    await host.evaluate(node => node.setAttribute('modal-size', 'lg'))
    await expect(host.locator('dialog')).toHaveCSS('width', '600px')
    await host.evaluate(node => {
        const select = document.createElement('cb-select') as Select
        Object.assign(select, {
            accessibleLabel: 'Visibility',
            value: 'private',
            options: [
                { label: 'Private', value: 'private' },
                { label: 'Public', value: 'public' },
            ],
        } satisfies Partial<Select>)
        node.append(select)
    })
    const select = host.locator('cb-select')
    await select.locator('cb-button[part~="trigger"]').click()
    await select.locator('cb-button[data-value="public"]').click()
    await expect(host).toHaveAttribute('open', 'true')
    await expect(select).toHaveAttribute('value', 'public')
})
