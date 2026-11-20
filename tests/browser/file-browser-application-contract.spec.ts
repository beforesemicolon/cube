import { expect, test } from '@playwright/test'
import type { FileBrowser } from '../../components/data-display/file-browser/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-file-browser')))
    await page.evaluate(() => {
        const browser = document.createElement('cb-file-browser') as FileBrowser
        Object.assign(browser, {
            accessibleLabel: 'Assets',
            rootLabel: 'Assets',
            currentFolderId: 'assets/branding',
            pathItems: [
                { id: 'assets', label: 'Assets' },
                { id: 'assets/branding', label: 'Branding' },
            ],
            entries: [
                {
                    id: 'assets/branding/logos',
                    name: 'Logos',
                    type: 'folder',
                    description: 'Brand folder',
                    metadata: ['12 items', 'Updated Oct 18, 2026'],
                    selectable: true,
                    actions: [
                        { id: 'move', label: 'Move' },
                        { id: 'rename', label: 'Rename' },
                    ],
                },
                {
                    id: 'assets/branding/mark.svg',
                    name: 'mark.svg',
                    type: 'file',
                    actions: [{ id: 'move', label: 'Move' }],
                },
            ],
            actions: [
                { id: 'move', label: 'Move' },
                { id: 'delete', label: 'Delete', tone: 'danger' },
            ],
            selectionMode: 'actions',
            createFolderEnabled: true,
            createFolderLabel: 'Create folder',
            uploadEnabled: true,
            uploadLabel: 'Upload files',
            refreshEnabled: true,
            refreshLabel: 'Refresh files',
            selectionActionsLabel: 'Selected actions',
            actionMenuLabel: 'Entry actions',
            searchLabel: 'Search assets',
            gridViewLabel: 'Grid',
            tableViewLabel: 'Table',
            breadcrumbLabel: 'Folder',
            expandPathLabel: 'Show parents',
            openEntryLabel: 'Open {entry}',
            selectEntryLabel: 'Select {entry}',
            deselectEntryLabel: 'Deselect {entry}',
        } satisfies Partial<FileBrowser>)
        document.querySelector('#fixture')?.append(browser)
    })
})

test('grid cards render generic entry metadata and include it in filtering', async ({
    page,
}) => {
    const browser = page.locator('cb-file-browser')
    const logos = browser.locator('[part~="entry-shell"]', {
        hasText: 'Logos',
    })

    await expect(logos.locator('[part~="entry-meta"]')).toHaveText(
        'Brand folder · 12 items · Updated Oct 18, 2026'
    )

    await browser.evaluate((element) => {
        ;(element as FileBrowser).query = '12 items'
    })

    await expect(logos).toBeVisible()
    await expect(
        browser.locator('[part~="entry-shell"]', { hasText: 'mark.svg' })
    ).toHaveCount(0)
})

test('shows a responsive selected-files popover instead of a footer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 })
    const host = page.locator('cb-file-browser')
    await host.evaluate((node) => {
        const browser = node as FileBrowser
        browser.selectionCountLabel = '{count} selected'
        browser.selectionLimitLabel = '{count} of {max} selected'
        browser.selectedFilesLabel = 'Selected files'
        browser.clearSelectionLabel = 'Clear all'
        browser.maxSelections = 3
        browser.entries = [
            { id: 'one', name: 'one.svg', type: 'file' },
            { id: 'two', name: 'two.svg', type: 'file' },
            { id: 'three', name: 'three.svg', type: 'file' },
        ]
        const selections: string[][] = []
        browser.addEventListener('selectionchange', (event) => {
            selections.push((event as CustomEvent<{ selectedIds: string[] }>).detail.selectedIds)
        })
        Object.assign(browser, { selections })
    })

    await expect(host.locator('footer[part~="selection"]')).toHaveCount(0)
    await expect(host.locator('cb-popover[part~="selection"]')).toHaveCount(0)
    await host.evaluate((node) => {
        ;(node as FileBrowser).selectedIds = ['one', 'two', 'three']
    })
    const search = host.getByRole('textbox', { name: 'Search assets' })
    const trigger = host.getByRole('button', { name: '3 selected' })
    await expect(trigger).toBeVisible()
    await expect.poll(async () => {
        const a = await search.boundingBox()
        const b = await trigger.boundingBox()
        return !!a && !!b && a.x < b.x
    }).toBe(true)
    await trigger.press('Enter')
    const dialog = host.getByRole('dialog', { name: 'Selected files' })
    await expect(dialog).toBeVisible()
    const selectedItems = host.locator('cb-list[part~="selected-files"]').getByRole('listitem')
    await expect(selectedItems).toHaveCount(3)
    await expect(host.getByText('3 of 3 selected')).toBeVisible()

    const remove = host.getByRole('button', { name: 'Remove two.svg' })
    await remove.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
    await trigger.press('Enter')
    await expect(dialog).toBeVisible()
    await host.evaluate((node) => {
        node.addEventListener('beforeselectionchange', (event) => event.preventDefault(), { once: true })
    })
    await remove.press('Enter')
    await expect(selectedItems).toHaveCount(3)
    await remove.click()
    await expect(selectedItems).toHaveCount(2)
    await expect(host.getByRole('button', { name: '2 selected' })).toBeVisible()
    await host.getByRole('button', { name: 'Clear all' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(search).toBeFocused()
    await expect(host.evaluate(node => Reflect.get(node, 'selections')))
        .resolves.toEqual([['one', 'three'], []])
})

test('flat current-folder entries render with an explicit navigable path', async ({
    page,
}) => {
    const host = page.locator('cb-file-browser')

    await expect(host.getByText('Logos', { exact: true })).toBeVisible()
    await expect(host.getByText('mark.svg', { exact: true })).toBeVisible()

    const navigated = host.evaluate(
        (node) =>
            new Promise<string>((resolve) => {
                node.addEventListener(
                    'navigate',
                    (event) =>
                        resolve(
                            (event as CustomEvent<{ folderId: string }>).detail
                                .folderId
                        ),
                    { once: true }
                )
            })
    )
    await host.getByRole('button', { name: 'Assets', exact: true }).click()
    await expect(navigated).resolves.toBe('assets')
})

for (const view of ['grid', 'table'] as const) {
    test(`navigates from a nested ${view} to any ancestor without the toolbar`, async ({
        page,
    }) => {
        const host = page.locator('cb-file-browser')
        await host.evaluate((element, view) => {
            const browser = element as FileBrowser
            Object.assign(browser, {
                toolbarEnabled: false,
                view,
                currentFolderId: 'leaf',
                pathItems: [
                    { id: 'assets', label: 'Assets' },
                    { id: 'one', label: 'Design' },
                    { id: 'two', label: 'Branding' },
                    { id: 'leaf', label: 'Logos' },
                ],
                entries: [{ id: 'example', name: 'mark.svg', type: 'file' }],
            })
            const navigated: string[] = []
            browser.addEventListener('navigate', (event: Event) => {
                navigated.push(
                    (event as CustomEvent<{ folderId: string }>).detail.folderId
                )
            })
            Object.assign(browser, { navigated })
        }, view)

        const path = host.getByRole('navigation', { name: 'Folder' })
        const current = path.locator('[aria-current="page"]')
        await expect(host.locator('[part~="toolbar"]')).toHaveCount(0)
        await expect(current).toHaveText('Logos')
        await expect(path.getByRole('button', { name: 'Logos' })).toHaveCount(0)

        const parent = path.getByRole('button', { name: 'Design' })
        await parent.focus()
        await parent.press('Enter')
        // The application has not yet sent its new pathItems or entries.
        await expect(current).toHaveText('Design')
        await expect(path.getByText('Branding')).toHaveCount(0)
        await expect(path.getByText('Logos')).toHaveCount(0)

        await path.getByRole('button', { name: 'Assets' }).click()
        await expect(current).toHaveText('Assets')
        await expect(path.getByRole('button', { name: 'Assets' })).toHaveCount(0)
        await expect(
            host.evaluate((element) =>
                Reflect.get(element, 'navigated')
            )
        ).resolves.toEqual(['one', 'assets'])
    })
}

test('create, upload, and refresh requests honor disabled and loading guards', async ({
    page,
}) => {
    const host = page.locator('cb-file-browser')
    await host.evaluate((node) => {
        const counts = { create: 0, upload: 0, refresh: 0 }
        node.addEventListener('createfolderrequest', () => counts.create++)
        node.addEventListener('uploadrequest', () => counts.upload++)
        node.addEventListener('refreshrequest', () => counts.refresh++)
        Object.assign(node, { requestCounts: counts })
    })

    await host.getByRole('button', { name: 'Create folder' }).click()
    await host.getByRole('button', { name: 'Upload files' }).click()
    await host.getByRole('button', { name: 'Refresh files' }).click()
    expect(
        await host.evaluate(
            (node) =>
                (
                    node as FileBrowser & {
                        requestCounts: Record<string, number>
                    }
                ).requestCounts
        )
    ).toEqual({ create: 1, upload: 1, refresh: 1 })

    await host.evaluate((node) => {
        Object.assign(node as FileBrowser, {
            createFolderDisabled: true,
            uploading: true,
            refreshing: true,
        })
    })
    await expect(host.getByRole('button', { name: 'Create folder' })).toBeDisabled()
    await expect(host.getByRole('button', { name: 'Upload files' })).toBeDisabled()
    await expect(host.getByRole('button', { name: 'Refresh files' })).toBeDisabled()
})

test('compact toolbars wrap every action without overlap or horizontal overflow', async ({
    page,
}) => {
    const host = page.locator('cb-file-browser')
    await host.evaluate((node) => {
        node.style.inlineSize = '273px'
    })

    await expect
        .poll(() =>
            host.evaluate((node) => {
                const actions = node.shadowRoot?.querySelector(
                    '[part~="toolbar-actions"]'
                )
                if (!(actions instanceof HTMLElement)) return false

                const boxes = Array.from(actions.children)
                    .filter((child) => child instanceof HTMLElement && !child.hidden)
                    .map((child) => child.getBoundingClientRect())
                const overlaps = boxes.some((box, index) =>
                    boxes.slice(index + 1).some(
                        (other) =>
                            box.left < other.right &&
                            box.right > other.left &&
                            box.top < other.bottom &&
                            box.bottom > other.top
                    )
                )

                return {
                    overlaps,
                    hostOverflows: node.scrollWidth > node.clientWidth + 1,
                    actionsOverflow:
                        actions.scrollWidth > actions.clientWidth + 1,
                }
            })
        )
        .toEqual({
            overlaps: false,
            hostOverflows: false,
            actionsOverflow: false,
        })
})

test('selection actions emit canonical selected entry details', async ({ page }) => {
    const host = page.locator('cb-file-browser')
    await host.evaluate((node) => {
        ;(node as FileBrowser).setSelection(['assets/branding/logos'])
    })

    const action = host.evaluate(
        (node) =>
            new Promise<{
                actionId: string
                scope: string
                selectedIds: readonly string[]
                selectedNames: readonly string[]
            }>((resolve) => {
                node.addEventListener(
                    'action',
                    (event) => {
                        const detail = (
                            event as CustomEvent<{
                                action: { id: string }
                                scope: string
                                selectedIds: readonly string[]
                                selectedEntries: readonly { name: string }[]
                            }>
                        ).detail
                        resolve({
                            actionId: detail.action.id,
                            scope: detail.scope,
                            selectedIds: detail.selectedIds,
                            selectedNames: detail.selectedEntries.map(
                                (entry) => entry.name
                            ),
                        })
                    },
                    { once: true }
                )
            })
    )

    await host.getByRole('button', { name: 'Selected actions' }).click()
    await host.getByRole('menuitem', { name: 'Move', exact: true }).click()

    await expect(action).resolves.toEqual({
        actionId: 'move',
        scope: 'selection',
        selectedIds: ['assets/branding/logos'],
        selectedNames: ['Logos'],
    })
})

test('double-clicking a navigation-only folder cannot activate replacement content', async ({
    page,
}) => {
    const host = page.locator('cb-file-browser')
    await host.evaluate((node) => {
        const browser = node as FileBrowser & {
            activationCounts: { navigate: number; open: number }
        }
        browser.entries = [
            { id: 'folder', name: 'Folder', type: 'folder' },
        ]
        browser.activationCounts = { navigate: 0, open: 0 }
        browser.addEventListener('navigate', () => {
            browser.activationCounts.navigate++
            browser.entries = [
                { id: 'replacement', name: 'Replacement', type: 'file' },
            ]
        })
        browser.addEventListener('entryopen', () => {
            browser.activationCounts.open++
        })
    })

    await host
        .getByRole('option', { name: 'Open Folder', exact: true })
        .dblclick()
    await expect(host.getByText('Replacement', { exact: true })).toBeVisible()
    expect(
        await host.evaluate(
            (node) =>
                (
                    node as FileBrowser & {
                        activationCounts: { navigate: number; open: number }
                    }
                ).activationCounts
        )
    ).toEqual({ navigate: 1, open: 0 })
})
