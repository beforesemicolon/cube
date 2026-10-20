import { expect } from '@playwright/test'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-action-bar', 'layout--action-bar', async ({ host }) => {
    await host.evaluate(node => {
        const start = document.createElement('span'); start.slot = 'start'; start.textContent = 'Release start'
        const end = document.createElement('span'); end.textContent = 'Release end'
        node.replaceChildren(start, end)
    })
    await expect(host.getByText('Release start')).toBeVisible()
    await expect(host.getByText('Release end')).toBeVisible()
    expect(await host.evaluate(node => node.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=start]')?.assignedElements()[0]?.textContent)).toBe('Release start')
})
