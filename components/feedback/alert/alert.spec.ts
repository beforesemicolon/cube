import { expect } from '@playwright/test'
import type { Alert } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-alert', 'feedback--alert', async ({ host }) => {
    await host.evaluate(node => {
        const container = document.createElement('div')
        container.style.inlineSize = '640px'
        node.parentElement?.insertBefore(container, node)
        container.append(node)
    })
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
    await expect.poll(async () => (await host.boundingBox())?.width).toBe(640)

    await host.evaluate(node => {
        const alert = node as Alert
        alert.label = ' '
        alert.value = ''
        alert.description = 'Standalone body'
    })
    await expect(host.locator('[part~=status-title]')).toHaveCount(0)
    await expect(host.locator('[part~=description]')).toHaveCSS('margin-top', '0px')
    await expect(host.getByRole('button', { name: 'Dismiss alert' })).toHaveCount(0)

    await host.evaluate(node => {
        const alert = node as Alert
        alert.dismissible = true
        alert.dismissLabel = 'Close notice'
        const events: string[] = []
        node.addEventListener('beforedismiss', event => {
            events.push(event.type)
            event.preventDefault()
        }, { once: true })
        node.addEventListener('dismiss', event => events.push(event.type))
        Object.assign(node, { dismissalEvents: events })
    })
    const dismiss = host.getByRole('button', { name: 'Close notice' })
    await dismiss.press('Enter')
    await expect(host).toBeVisible()
    await dismiss.click()
    await expect(host).toBeHidden()
    await expect(host.evaluate(node => Reflect.get(node, 'dismissalEvents')))
        .resolves.toEqual(['beforedismiss', 'dismiss'])
})
