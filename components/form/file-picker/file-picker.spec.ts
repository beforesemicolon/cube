import { expect } from '@playwright/test'
import type { FilePicker } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-file-picker', 'form--file-picker', async ({ host, page }) => {
    await host.evaluate(node => { Object.assign(node, { multiple: true, accept: 'image/*', presentation: 'button', fileLabel: 'Choose images', icon: 'image' } satisfies Partial<FilePicker>) })
    await expect(host.locator('input[type=file]')).toHaveJSProperty('multiple', true)
    await expect(host.locator('input[type=file]')).toHaveAttribute('accept', 'image/*')
    await expect(host.getByRole('button', { name: 'Choose images' })).toBeVisible()
    const chooser = page.waitForEvent('filechooser')
    await host.getByRole('button', { name: 'Choose images' }).click()
    await (await chooser).setFiles({ name: 'chosen.png', mimeType: 'image/png', buffer: Buffer.from('image') })
    await expect(host.locator('input[type=file]')).toHaveAttribute('accept', 'image/*')
    expect(await host.evaluate(node => (node as FilePicker).files.map(file => file.name))).toEqual(['chosen.png'])
    await host.evaluate(node => { (node as FilePicker).disabled = true })
    expect(await host.evaluate(node => (node as FilePicker).pickFiles())).toBe(false)
})
