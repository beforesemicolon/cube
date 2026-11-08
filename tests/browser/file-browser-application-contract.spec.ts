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
