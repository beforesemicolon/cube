import { expect } from '@playwright/test'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-action-bar', 'layout--action-bar', async ({ host }) => {
    await host.evaluate(node => {
        const start = document.createElement('input'); start.slot = 'start'; start.setAttribute('aria-label', 'Release search'); start.style.inlineSize = '100%'
        const end = document.createElement('span'); end.textContent = 'Release end'
        const namedAction = document.createElement('cb-button'); namedAction.slot = 'actions'; namedAction.textContent = 'Release named action'
        const overflow = document.createElement('span'); overflow.slot = 'overflow'; overflow.textContent = 'Release overflow'
        Object.assign(node, { wrap: true, actionsOnly: false })
        node.replaceChildren(start, end, namedAction, overflow)
    })
    await expect(host.getByRole('textbox', { name: 'Release search' })).toBeVisible()
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
    await expect(host.locator('[part=start]')).toHaveCSS('max-inline-size', '420px')
    expect(await host.evaluate(node => node.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=start]')?.assignedElements()[0]?.getAttribute('aria-label'))).toBe('Release search')
    const startGeometry = await host.locator('[part=start]').evaluate(node => ({
        left: node.getBoundingClientRect().left,
        width: node.getBoundingClientRect().width,
    }))
    const searchGeometry = await host.getByRole('textbox', { name: 'Release search' }).evaluate(node => ({
        left: node.getBoundingClientRect().left,
        width: node.getBoundingClientRect().width,
    }))
    expect(startGeometry.width).toBeLessThanOrEqual(420)
    expect(searchGeometry.left).toBe(startGeometry.left)
    expect(searchGeometry.width).toBe(startGeometry.width)
    expect(await host.evaluate(node => node.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=overflow]')?.assignedElements()[0]?.textContent)).toBe('Release overflow')

    await host.evaluate(node => {
        node.replaceChildren(...['start', 'start', '', 'actions', 'overflow'].map((slot, index) => {
            const button = document.createElement('cb-button')
            button.slot = slot
            button.textContent = `Spaced action ${index}`
            return button
        }))
    })
    const actionGaps = () => host.evaluate(node => {
        const rects = [...node.children].map(child => child.getBoundingClientRect())
        return [rects[1]!.left - rects[0]!.right, rects[3]!.left - rects[2]!.right, rects[4]!.left - rects[3]!.right]
    })
    await expect.poll(actionGaps).toEqual([14, 14, 14])
    await host.evaluate(node => node.style.setProperty('--component-action-bar-item-gap', '20px'))
    await expect.poll(actionGaps).toEqual([20, 20, 20])

    await host.evaluate(node => { Object.assign(node, { actionsOnly: true }) })
    await expect(host).toHaveAttribute('data-actions-only', '')
    await expect(host).toHaveCSS('vertical-align', 'top')
    await expect(host.locator('[part=start]')).toHaveCSS('display', 'none')
})
