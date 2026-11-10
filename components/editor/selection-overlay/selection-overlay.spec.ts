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
    const toolbar = host.locator('cb-toolbar[part~=controls]')
    await host.evaluate(node => { (node as SelectionOverlay).rect = { x: 200, y: 180, width: 500, height: 120 } })
    for (const align of ['start', 'center', 'end'] as const) {
        await host.evaluate((node, align) => { (node as SelectionOverlay).actionsAlign = align }, align)
        await expect.poll(async () => {
            const selection = await host.boundingBox(), actions = await toolbar.boundingBox()
            if (!selection || !actions) return Infinity
            const expected = selection.x + (selection.width - actions.width) * (align === 'start' ? 0 : align === 'end' ? 1 : .5)
            return Math.abs(actions.x - expected)
        }).toBeLessThan(1)
    }
    await host.getByRole('button', { name: 'Inspect selection', exact: true }).click()
    await expect(host).toHaveAttribute('data-last-action', 'inspect')
    await host.evaluate(node => { Object.assign(node, { movable: false } satisfies Partial<SelectionOverlay>) })
    await expect(outline).toHaveCSS('pointer-events', 'none')
    await expect(outline).toHaveAttribute('tabindex', '-1')
    await host.evaluate(node => { Object.assign(node, { movable: true } satisfies Partial<SelectionOverlay>) })
    await expect(outline).toHaveCSS('pointer-events', 'auto')
    await host.evaluate((node: SelectionOverlay) => {
        node.actions = []
        const input = node.ownerDocument.createElement('input')
        input.slot = 'actions-end'
        input.setAttribute('aria-label', 'Selection command')
        node.append(input)
    })
    const input = host.getByRole('textbox', { name: 'Selection command' })
    await expect(toolbar).toBeVisible()
    await input.fill('Edit selection')
    await expect(input).toHaveValue('Edit selection')
    await input.evaluate(node => node.remove())
    await expect(toolbar).toBeHidden()

})
