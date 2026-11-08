import { expect } from '@playwright/test'
import type { Alert } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-alert', 'feedback--alert', async ({ host }) => {
    await host.evaluate(node => {
        Object.assign(node, { label: 'Release message', tone: 'warning' } satisfies Partial<Alert>)
        const content = document.createElement('p')
        content.textContent = 'Review the failed records before retrying.'
        node.append(content)
    })
    await expect(host.locator("[part~=status-title]")).toHaveText("Release message")
    await expect(host.locator('[part~=display]')).toHaveAttribute('role', 'alert')
    await expect(host.locator('[part~=display]')).toHaveAttribute('aria-live', 'assertive')
    await expect(host.locator('[part~=content]')).not.toHaveAttribute('hidden')
    await expect(host.getByText('Review the failed records before retrying.', { exact: true })).toBeVisible()
})
