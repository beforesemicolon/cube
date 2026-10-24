import { expect } from '@playwright/test'
import type { SelectionOverlay } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-selection-overlay', 'editor--selection-overlay', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"rect":{"x":20,"y":30,"width":140,"height":90}} satisfies Partial<SelectionOverlay>) })
    await expect(host).toHaveCSS("width", "140px")
    const outline = host.locator('[part~=outline]')
    await expect(outline).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(outline).toHaveCSS('pointer-events', 'auto')
    await host.evaluate(node => {
        ;(node as SelectionOverlay).actions = [{ id: 'inspect', label: 'Inspect selection' }]
        node.addEventListener('action', event => { node.dataset.lastAction = (event as CustomEvent<{ action: { id: string } }>).detail.action.id })
    })
    await host.getByRole('button', { name: 'Inspect selection', exact: true }).click()
    await expect(host).toHaveAttribute('data-last-action', 'inspect')
    await host.evaluate(node => { Object.assign(node, { movable: false } satisfies Partial<SelectionOverlay>) })
    await expect(outline).toHaveCSS('pointer-events', 'none')
    await expect(outline).toHaveAttribute('tabindex', '-1')
    await host.evaluate(node => { Object.assign(node, { movable: true } satisfies Partial<SelectionOverlay>) })
    await expect(outline).toHaveCSS('pointer-events', 'auto')
})
