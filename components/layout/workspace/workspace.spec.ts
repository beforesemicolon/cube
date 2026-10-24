import { expect } from '@playwright/test'
import type { Workspace } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-workspace', 'layout--workspace', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"bottomOpen":false} satisfies Partial<Workspace>) })
    await expect(host.locator('[part~=bottom-panel]')).toBeHidden()
    await host.evaluate(node => {
        Object.assign(node, { variant: 'tabbed', startItems: [{ id: 'pages', name: 'Pages', renderContent: () => {
            const content = document.createElement('p'); content.textContent = 'Lazy pages'; return content
        } }] } satisfies Partial<Workspace>)
    })
    await expect(host.getByRole('tab', { name: 'Pages', exact: true })).toBeVisible()
    await expect(host.getByText('Lazy pages')).toBeVisible()
    await host.getByRole('tab', { name: 'Pages', exact: true }).click()
    await expect(host.getByText('Lazy pages')).toHaveCount(0)
})
