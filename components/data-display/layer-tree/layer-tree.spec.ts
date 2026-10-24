import { expect } from '@playwright/test'
import type { LayerTree } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-layer-tree', 'data-display--layer-tree', async ({ host }) => {
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
})
