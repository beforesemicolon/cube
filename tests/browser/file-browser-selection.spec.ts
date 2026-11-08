import { expect, test } from '@playwright/test'
import type { FileBrowser } from '../../components/data-display/file-browser/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-file-browser')))
    await page.evaluate(() => {
        const browser = document.createElement('cb-file-browser') as FileBrowser
        Object.assign(browser, { accessibleLabel: 'Assets', rootLabel: 'Assets', searchLabel: 'Search assets', searchPlaceholder: 'Search this folder',
            gridViewLabel: 'Grid', tableViewLabel: 'Table', breadcrumbLabel: 'Folder', expandPathLabel: 'Show parents',
            nameLabel: 'Name', typeLabel: 'Type', sizeLabel: 'Size', modifiedLabel: 'Modified', selectionMode: 'multiple', maxSelections: 2,
            selectionCountLabel: '{count} selected', selectionLimitLabel: '{count} of {max} selected', selectedFilesLabel: 'Selected files',
            clearSelectionLabel: 'Clear selection', removeSelectionLabel: 'Remove {entry}', selectEntryLabel: 'Select {entry}', deselectEntryLabel: 'Deselect {entry}', openEntryLabel: 'Open {entry}',
            entries: [{ id: 'folder', name: 'Photos', type: 'folder' }, { id: 'a', name: 'Alpha.png', type: 'file' }, { id: 'b', name: 'Beta.png', type: 'file' },
                { id: 'c', name: 'Charlie.png', type: 'file', parentId: 'folder' }, { id: 'd', name: 'Delta.png', type: 'file', parentId: 'folder' }] } satisfies Partial<FileBrowser>)
        browser.style.setProperty('--component-file-browser-height', '400px')
        document.querySelector('#fixture')?.append(browser)
    })
})

test('cross-folder selections stay ordered and the native summary counts, removes and clears with a maximum', async ({ page }) => {
    const host = page.locator('cb-file-browser'), selected = host.getByRole('region', { name: 'Selected files', exact: true })
    await host.getByRole('option', { name: 'Select Beta.png', exact: true }).click()
    await host.getByRole('option', { name: 'Open Photos', exact: true }).click()
    await host.getByRole('option', { name: 'Select Charlie.png', exact: true }).click()
    await expect(host.getByRole('status')).toHaveText('2 of 2 selected')
    await expect(host.getByRole('option', { name: 'Select Delta.png', exact: true })).toBeDisabled()
    expect(await host.evaluate(node => (node as FileBrowser).selectedIds)).toEqual(['b', 'c'])
    expect(await host.evaluate(node => (node as FileBrowser).selectionCount)).toBe(2)
    expect(await host.evaluate(node => (node as FileBrowser).setSelection(['a', 'b', 'c']))).toBe(false)
    await selected.getByRole('button', { name: 'Remove Beta.png', exact: true }).click()
    await expect(host.getByRole('option', { name: 'Select Delta.png', exact: true })).toBeEnabled()
    await host.getByRole('option', { name: 'Select Delta.png', exact: true }).click()
    await host.getByRole('button', { name: 'Clear selection', exact: true }).click()
    await expect(host.getByRole('status')).toHaveText('0 of 2 selected')
    await expect(selected).toHaveCount(0)
})

test('Table preserves off-folder selections, blocks folders and respects the cap without stale checks', async ({ page }) => {
    const host = page.locator('cb-file-browser')
    await host.getByRole('option', { name: 'Select Beta.png', exact: true }).click()
    await host.getByRole('option', { name: 'Open Photos', exact: true }).click()
    await expect(
        host.getByRole('option', { name: 'Select Charlie.png', exact: true })
    ).toBeVisible()
    await host.getByRole('radio', { name: 'Table', exact: true }).click()
    await host.getByRole('checkbox', { name: 'Assets', exact: true }).click()
    expect(await host.evaluate(node => (node as FileBrowser).selectedIds)).toEqual(['b'])
    await expect(host.getByRole('checkbox', { name: 'Assets', exact: true })).not.toBeChecked()
    await host.getByRole('checkbox', { name: 'Select Charlie.png', exact: true }).click()
    await expect(host.getByRole('checkbox', { name: 'Deselect Charlie.png', exact: true })).toBeChecked()
    expect(await host.evaluate(node => (node as FileBrowser).selectedIds)).toEqual(['b', 'c'])
    await expect(host.getByRole('checkbox', { name: 'Select Delta.png', exact: true })).toBeDisabled()
    await host.getByRole('region', { name: 'Selected files', exact: true }).getByRole('button', { name: 'Remove Charlie.png', exact: true }).click()
    await expect(host.getByRole('checkbox', { name: 'Select Delta.png', exact: true })).toBeEnabled()
    await host.getByRole('checkbox', { name: 'Select Delta.png', exact: true }).click()
    expect(await host.evaluate(node => (node as FileBrowser).selectedIds)).toEqual(['b', 'd'])
    await host.evaluate(node => { (node as FileBrowser).navigate('') })
    await expect(host.getByRole('checkbox', { name: 'Select Photos', exact: true })).toBeDisabled()
    await expect(host.getByRole('status')).toHaveText('2 of 2 selected')
})

test('single mode replaces the previous file and keyboard removal returns to an empty selection', async ({ page }) => {
    const host = page.locator('cb-file-browser')
    await host.evaluate(node => { (node as FileBrowser).selectionMode = 'single' })
    await host.getByRole('option', { name: 'Select Alpha.png', exact: true }).click()
    await host.getByRole('option', { name: 'Select Beta.png', exact: true }).click()
    await expect(host.getByRole('status')).toHaveText('1 of 1 selected')
    expect(await host.evaluate(node => (node as FileBrowser).selectedIds)).toEqual(['b'])
    const remove = host.getByRole('button', { name: 'Remove Beta.png', exact: true })
    await remove.focus(); await remove.press('Enter')
    await expect(host.getByRole('status')).toHaveText('0 of 1 selected')
})

test('a compact toolbar keeps upload and view controls side by side and scroll stays inside the browser', async ({ page }) => {
    await page.setViewportSize({ width: 380, height: 800 })
    const host = page.locator('cb-file-browser')
    await host.evaluate(node => { Object.assign(node as FileBrowser, { uploadEnabled: true, uploadLabel: 'Upload files' }) })
    const upload = (await host.getByRole('button', { name: 'Upload files', exact: true }).boundingBox())!
    const views = (await host.locator('[part~="view-toggle"]').boundingBox())!
    expect(Math.abs(upload.y + upload.height / 2 - views.y - views.height / 2)).toBeLessThan(2)
    expect(await host.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    await expect(host.locator('div[part~="content"]')).toHaveCSS('overscroll-behavior', 'contain')
})
