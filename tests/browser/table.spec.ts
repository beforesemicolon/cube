import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-table')))
}

async function mountTable(page: Page): Promise<void> {
    await page.evaluate(() => {
        const table = document.createElement('cb-table') as HTMLElement & Record<string, string | number | boolean | readonly object[] | readonly string[]>
        Object.assign(table, {
            label: 'Resources',
            items: [
                { id: 'root', parentId: '', name: 'Website', status: 'Published', selectable: true },
                { id: 'home', parentId: 'root', name: 'Home', status: 'Published', selectable: true },
                { id: 'pricing', parentId: 'root', name: 'Pricing', status: 'Draft', selectable: true },
                { id: 'archive', parentId: '', name: 'Archive', status: 'Archived', selectable: false },
            ],
            columns: [
                { id: 'name', header: 'Name', field: 'name', sortable: true, minWidth: 180 },
                { id: 'status', header: 'Status', field: 'status', sortable: true, width: 120 },
            ],
            itemKey: 'id', parentBy: 'parentId', expandedKeys: ['root'], selectionMode: 'multiple', selectedKeys: ['home'],
            selectableField: 'selectable', sortBy: 'name', sortDirection: 'asc', rowActivation: true, resizable: true,
            selectAllLabel: 'Select all visible rows', deselectAllLabel: 'Deselect all visible rows', selectRowLabel: 'Select {row}',
            deselectRowLabel: 'Deselect {row}', expandRowLabel: 'Expand {row}', collapseRowLabel: 'Collapse {row}',
            sortAscendingLabel: 'Sort {column} ascending', sortDescendingLabel: 'Sort {column} descending',
            ascendingLabel: 'ascending', descendingLabel: 'descending', expandedLabel: 'expanded', collapsedLabel: 'collapsed',
            resizeColumnLabel: 'Resize {column} column', selectionAnnouncement: '{count} rows selected',
            sortAnnouncement: '{column} sorted {direction}', expansionAnnouncement: '{row} is {state}',
        })
        document.querySelector('#fixture')?.append(table)
    })
}

test('sorts siblings, expands nested rows, selects eligible rows and activates rows', async ({ page }) => {
    await start(page)
    await mountTable(page)
    const table = page.locator('cb-table')
    await expect(table.getByRole('table', { name: 'Resources' })).toBeVisible()
    await expect(table.locator('tbody [part~="data-row"]')).toHaveCount(4)
    const parentContentX = await table.locator('tr[data-row-key="root"] [part~="cell-content"]').evaluate(element => element.getBoundingClientRect().x)
    const childContentX = await table.locator('tr[data-row-key="home"] [part~="cell-content"]').evaluate(element => element.getBoundingClientRect().x)
    expect(childContentX - parentContentX).toBeGreaterThanOrEqual(24)
    await expect(table.locator('tr[data-row-key="root"]')).toHaveAttribute('data-parent', '')
    await expect(table.locator('tr[data-row-key="home"]')).toHaveAttribute('data-child', '')
    await expect(table.locator('tr[data-row-key="home"]')).toHaveAttribute('data-depth', '1')
    await expect(table.locator('tr[data-row-key="home"] [part~="tree-indent"]')).toBeVisible()

    await table.getByRole('button', { name: 'Collapse Website' }).click()
    await expect(table.locator('tbody [part~="data-row"]')).toHaveCount(2)
    await expect(table.getByText('Home', { exact: true })).toHaveCount(0)
    await table.getByRole('button', { name: 'Expand Website' }).click()
    await expect(table.locator('tbody [part~="data-row"]')).toHaveCount(4)

    await table.getByRole('button', { name: 'Sort Name descending' }).click()
    await expect(table.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending')
    await expect(table.locator('tbody [part~="data-row"]').first()).toContainText('Website')
    await expect(table.locator('tbody [part~="data-row"]').nth(1)).toContainText('Pricing')

    await table.getByRole('checkbox', { name: 'Select Pricing' }).check()
    await expect(table.getByRole('checkbox', { name: 'Deselect Pricing' })).toBeChecked()
    await expect(table.locator('[part~="live"]')).toHaveText('2 rows selected')
    await expect(table.getByRole('checkbox', { name: 'Select Archive' })).toBeDisabled()

    const activation = page.evaluate(() => new Promise<string>(resolve => {
        document.querySelector('cb-table')?.addEventListener('rowactivate', event => {
            const detail = (event as CustomEvent<{ key: string }>).detail
            resolve(detail.key)
        }, { once: true })
    }))
    await table.locator('tbody [part~="data-row"]').filter({ hasText: 'Archive' }).click({ position: { x: 200, y: 20 } })
    await expect(activation).resolves.toBe('archive')
})

test('keeps headers and rows aligned while resizing columns with a pointer', async ({ page }) => {
    await start(page)
    await mountTable(page)
    const table = page.locator('cb-table')
    const nameHeader = table.locator('th[data-column-id="name"]')
    const nameCell = table.locator('tr[data-row-key="root"] td[data-column-id="name"]')
    const statusHeader = table.locator('th[data-column-id="status"]')
    const statusCell = table.locator('tr[data-row-key="root"] td[data-column-id="status"]')

    const aligned = async (): Promise<readonly number[]> => {
        const rectangles = await Promise.all([nameHeader, nameCell, statusHeader, statusCell].map(locator => locator.evaluate(element => {
            const rect = element.getBoundingClientRect()
            return { x: rect.x, width: rect.width }
        })))
        return [
            Math.abs(rectangles[0]!.x - rectangles[1]!.x),
            Math.abs(rectangles[0]!.width - rectangles[1]!.width),
            Math.abs(rectangles[2]!.x - rectangles[3]!.x),
            Math.abs(rectangles[2]!.width - rectangles[3]!.width),
        ]
    }

    for (const difference of await aligned()) expect(difference).toBeLessThan(1)
    const beforeName = await nameHeader.evaluate(element => element.getBoundingClientRect().width)
    const separator = table.getByRole('separator', { name: 'Resize Name column' })
    const handle = await separator.boundingBox()
    if (!handle) throw new Error('Expected the Name column resize handle to be visible')
    const resized = table.evaluate(element => new Promise<number>(resolve => {
        element.addEventListener('columnresize', event => {
            resolve((event as CustomEvent<{ width: number }>).detail.width)
        }, { once: true })
    }))
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
    await page.mouse.down()
    await page.mouse.move(handle.x + handle.width / 2 + 80, handle.y + handle.height / 2, { steps: 4 })
    await page.mouse.up()

    await expect(resized).resolves.toBeGreaterThan(beforeName + 70)
    await expect.poll(() => nameHeader.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(beforeName + 70)
    await expect.poll(() => table.locator('col[data-column-id="name"]').evaluate(element => Number.parseFloat((element as HTMLElement).style.width))).toBeGreaterThan(beforeName + 70)
    for (const difference of await aligned()) expect(difference).toBeLessThan(1)
})

test('renders custom cells, groups, keyboard column resizing, loading and empty states', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const table = document.createElement('cb-table') as HTMLElement & Record<string, string | number | boolean | readonly object[]>
        const columns = [
            { id: 'name', header: 'Name', minWidth: 120, cell: ({ item }: { item: Readonly<Record<string, string>> }) => {
                const strong = document.createElement('strong')
                strong.textContent = item.name
                strong.dataset.customCell = 'true'
                return strong
            } },
            { id: 'count', header: 'Count', field: 'count', align: 'end', width: 100 },
        ]
        Object.assign(table, {
            label: 'Grouped resources', items: [{ id: 'one', group: 'A', name: 'Custom value', count: 4 }], columns,
            itemKey: 'id', groupBy: 'group', resizable: true, collapseGroupLabel: 'Collapse {group}', expandGroupLabel: 'Expand {group}',
            resizeColumnLabel: 'Resize {column} column', emptyLabel: 'No resources', loadingLabel: 'Loading resources',
        })
        document.querySelector('#fixture')?.append(table)
    })
    const table = page.locator('cb-table')
    await expect(table.locator('[data-custom-cell="true"]')).toHaveText('Custom value')
    await expect(table.getByRole('button', { name: 'Collapse A' })).toBeVisible()
    const separator = table.getByRole('separator', { name: 'Resize Name column' })
    await separator.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => table.locator('th').filter({ hasText: 'Name' }).first().evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(120)

    await table.evaluate(element => { Reflect.set(element, 'loading', true) })
    await expect(table.locator('cb-skeleton[part="loading-skeleton"]')).toBeVisible()
    await expect(table.getByRole('status', { name: 'Loading resources' })).toBeVisible()
    await table.evaluate(element => { Reflect.set(element, 'loading', false); Reflect.set(element, 'items', []) })
    await expect(table.getByRole('status')).toHaveText('No resources')
})

test('rich table has no automatic accessibility violations', async ({ page }) => {
    await start(page)
    await mountTable(page)
    const results = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(results.violations).toEqual([])
})
