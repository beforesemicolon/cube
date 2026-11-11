import { expect } from '@playwright/test'
import type { Table } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-table', 'data-display--table', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {
        items: [{ id: 'release', name: 'Release row', status: 'Draft', owner: 'Owner', updated: 'Now' }],
        columns: [
            { id: 'name', header: 'Name', field: 'name' },
            { id: 'status', header: 'Status', cell: () => ({ render(target: Element) { const strong = document.createElement('strong'); strong.textContent = 'Rich draft'; target.replaceChildren(strong) } }) },
        ],
        expandedKeys: [], selectedKeys: [],
    } satisfies Partial<Table>) })
    await expect(host.getByText("Release row", { exact: true }).first()).toBeVisible()
    await expect(host.getByText('Rich draft', { exact: true })).toBeVisible()
    const firstHeader = host.locator('th[data-column-id="name"] [part~="header-content"]')
    const firstContent = host.locator('td[data-column-id="name"] [part~="cell-content"]')
    await expect.poll(async () => {
        const headerStart = await firstHeader.evaluate(element => element.getBoundingClientRect().left)
        const contentStart = await firstContent.evaluate(element => element.getBoundingClientRect().left)
        return Math.abs(headerStart - contentStart)
    }).toBeLessThan(1)
    await host.evaluate(node => {
        Object.assign(node, {
            items: [],
            emptyLabel: '',
            messages: { emptyLabel: 'No localized releases' },
        } satisfies Partial<Table>)
    })
    await expect(host.getByText('No localized releases', { exact: true })).toBeVisible()
    await host.evaluate(node => {
        node.style.height = '160px'
        node.style.setProperty('--component-table-max-height', '100%')
        Object.assign(node, {
            items: Array.from({ length: 12 }, (_, index) => ({
                id: `release-${index}`,
                name: `Release ${index}`,
                status: 'Draft',
            })),
        } satisfies Partial<Table>)
    })
    const viewport = host.locator('[part~="viewport"]')
    await expect
        .poll(() =>
            viewport.evaluate(
                element => element.scrollHeight > element.clientHeight
            )
        )
        .toBe(true)
})
