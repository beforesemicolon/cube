import { expect } from '@playwright/test'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-action-bar', 'layout--action-bar', async ({ host }) => {
    await host.evaluate(node => {
        const start = document.createElement('span'); start.slot = 'start'; start.textContent = 'Release start'
        const end = document.createElement('span'); end.textContent = 'Release end'
        const namedAction = document.createElement('cb-button'); namedAction.slot = 'actions'; namedAction.textContent = 'Release named action'
        const overflow = document.createElement('span'); overflow.slot = 'overflow'; overflow.textContent = 'Release overflow'
        Object.assign(node, { wrap: true, actionsOnly: false })
        node.replaceChildren(start, end, namedAction, overflow)
    })
    await expect(host.getByText('Release start')).toBeVisible()
    await expect(host.getByText('Release end')).toBeVisible()
    await expect(host.getByText('Release named action')).toBeVisible()
    await expect(host.locator('cb-button').locator('button')).toHaveCSS('height', '28px')
    await expect(host.getByText('Release overflow')).toBeVisible()
    await expect(host.locator('slot').first()).toHaveCSS('display', 'contents')
    expect(
        await host.locator('[part=actions]').evaluate(node =>
            [...node.childNodes].some(child => child.nodeType === Node.TEXT_NODE)
        )
    ).toBe(false)
    await expect(host).toHaveAttribute('data-wrap', '')
    await expect(host.locator('[part=actions]')).toHaveCSS('flex-wrap', 'wrap')
    expect(await host.evaluate(node => node.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=start]')?.assignedElements()[0]?.textContent)).toBe('Release start')
    expect(await host.evaluate(node => node.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=overflow]')?.assignedElements()[0]?.textContent)).toBe('Release overflow')

    await host.evaluate(node => { Object.assign(node, { actionsOnly: true }) })
    await expect(host).toHaveAttribute('data-actions-only', '')
    await expect(host).toHaveCSS('vertical-align', 'top')
    await expect(host.locator('[part=start]')).toHaveCSS('display', 'none')
})
