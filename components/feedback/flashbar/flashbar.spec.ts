import { expect } from '@playwright/test'
import type { Flashbar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-flashbar', 'feedback--flashbar', async ({ host, page }) => {
    await host.evaluate(node => { Object.assign(node, {"messages":[{"id":"release","title":"Release flash","message":"Release body","duration":0}]} satisfies Partial<Flashbar>) })
    await expect(host.getByText("Release flash", { exact: true }).first()).toBeVisible()
    await host.evaluate(node => {
        ;(node as Flashbar).show({
            id: 'loading-alias',
            title: 'Saving',
            loading: true,
            actionLabel: 'Retry',
            actionCallback: () => {
                document.body.dataset.flashbarAction = 'called'
            },
        })
    })

    await expect(host).toContainText('Saving')
    await expect(host.getByRole('button', { name: 'Dismiss' })).toHaveCount(0)
    await host.getByRole('button', { name: 'Retry' }).click()
    await expect(page.locator('body')).toHaveAttribute(
        'data-flashbar-action',
        'called'
    )
})
