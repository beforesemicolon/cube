import { expect } from '@playwright/test'
import type { LayerTree } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-layer-tree', 'data-display--layer-tree', async ({ page, host }) => {
    await host.evaluate(node => { Object.assign(node, {
        items: [{ id: 'release', label: 'Release layer', children: [{ id: 'heading', label: 'Heading', actions: [{ id: 'inspect', label: 'Inspect heading' }] }] }],
        expandedIds: [], selectedIds: [], multiple: false,
        editable: false, reorderable: false, showLock: false, showVisibility: false,
        expandLabel: 'Expand {item}', collapseLabel: 'Collapse {item}',
    } satisfies Partial<LayerTree>) })
    await expect(host.getByText("Release layer", { exact: true }).first()).toBeVisible()
    await host.getByText('Release layer', { exact: true }).click()
    await expect(host).toHaveJSProperty('selectedIds', ['release'])
    await host.getByRole('button', { name: 'Expand Release layer' }).click()
    await expect(host).toHaveJSProperty('selectedIds', ['release'])
    const root = host.getByRole('treeitem').filter({ hasText: 'Release layer' })
    await root.press('ArrowDown')
    const child = host.getByRole('treeitem').filter({ hasText: 'Heading' })
    await expect(child).toBeFocused()
    await child.press('Enter')
    await expect(host).toHaveJSProperty('selectedIds', ['heading'])
    await host.evaluate(node => node.addEventListener('action', event => {
        const detail = (event as CustomEvent<{ id: string; action: { id: string } }>).detail
        node.dataset.lastAction = `${detail.id}:${detail.action.id}`
    }))
    await host.getByRole('button', { name: 'Inspect heading', exact: true }).click()
    await expect(host).toHaveAttribute('data-last-action', 'heading:inspect')
    await expect(host).toHaveJSProperty('selectedIds', ['heading'])
    await child.press('ArrowUp')
    await root.press(' ')
    await expect(host).toHaveJSProperty('selectedIds', ['release'])
    await host.evaluate(node => {
        const actions = [
            { id: 'up', label: 'Move up', icon: 'up' }, { id: 'down', label: 'Move down', icon: 'down' },
            { id: 'lock', label: 'Lock layer', icon: 'lock' }, { id: 'hide', label: 'Hide layer', icon: 'eye' },
        ]
        Object.assign(node, { items: [
            { id: 'active', label: 'Selected layer', actions },
            { id: 'parent', label: 'Container', actions, children: [{ id: 'idle', label: 'A deeply nested layer whose label can use the full row width', description: '<section> · .a-long-technical-description', actions }] },
        ], selectedIds: ['active'], expandedIds: ['parent'] } satisfies Partial<LayerTree>)
        node.style.width = '420px'
    })
    await page.mouse.move(0, 0)
    const idle = host.locator('[part~=row][data-id=idle]'), active = host.locator('[part~=row][data-id=active]')
    const controls = idle.locator('[part~=actions]'), copy = idle.locator('[part~=copy]')
    await expect(controls).toHaveCSS('display', 'none')
    await expect(idle.getByRole('button')).toHaveCount(0)
    await expect(active.locator('[part~=actions]')).toBeVisible()
    const fullWidth = (await copy.boundingBox())!.width
    const rowBounds = (await idle.boundingBox())!, copyBounds = (await copy.boundingBox())!
    expect(rowBounds.x + rowBounds.width - copyBounds.x - copyBounds.width).toBeLessThan(8)
    await idle.hover()
    await expect(controls).toBeVisible()
    expect(fullWidth - (await copy.boundingBox())!.width).toBeGreaterThan(60)
    await page.mouse.move(0, 0)
    await expect(controls).toHaveCSS('display', 'none')
    await expect(copy).toHaveCSS('width', `${fullWidth}px`)
    await active.focus()
    await active.press('ArrowDown')
    await host.locator('[part~=row][data-id=parent]').press('ArrowDown')
    await expect(idle).toBeFocused()
    await expect(controls).toBeVisible()
    await idle.press('Tab')
    const moveUp = idle.getByRole('button', { name: 'Move up', exact: true })
    await expect(moveUp).toBeFocused()
    await moveUp.press('Enter')
    await expect(host).toHaveAttribute('data-last-action', 'idle:up')
    await expect(host).toHaveJSProperty('selectedIds', ['active'])
})
