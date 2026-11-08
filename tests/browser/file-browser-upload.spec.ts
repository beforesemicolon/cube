import { expect, test } from '@playwright/test'
import type { FileBrowser } from '../../components/data-display/file-browser/index.js'

test('file browser upload action reports the current folder and respects upload/disabled states', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-file-browser')))
    await page.evaluate(() => {
        const browser = document.createElement('cb-file-browser') as FileBrowser
        Object.assign(browser, { accessibleLabel: 'Assets', uploadLabel: 'Upload files', currentFolderId: 'photos', entries: [{ id: 'photos', type: 'folder', name: 'Photos' }] })
        browser.addEventListener('uploadrequest', event => { if (event instanceof CustomEvent) browser.dataset.uploadFolder = (event as CustomEvent<{ folderId: string }>).detail.folderId })
        document.querySelector('#fixture')?.append(browser)
    })
    const host = page.locator('cb-file-browser'), upload = host.getByRole('button', { name: 'Upload files', exact: true })
    await expect(upload).toBeHidden()
    await host.evaluate(node => { (node as FileBrowser).uploadEnabled = true })
    await upload.click()
    await expect(host).toHaveAttribute('data-upload-folder', 'photos')
    await host.evaluate(node => { (node as FileBrowser).uploading = true })
    await expect(upload).toBeDisabled()
    expect(await host.evaluate(node => (node as FileBrowser).requestUpload())).toBe(false)
    await host.evaluate(node => { Object.assign(node as FileBrowser, { uploading: false, disabled: true }) })
    await expect(upload).toBeDisabled()
    expect(await host.evaluate(node => (node as FileBrowser).requestUpload())).toBe(false)
})
