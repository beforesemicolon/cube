import { expect } from '@playwright/test'
import type { RichTextToolbar } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-rich-text-toolbar', 'form--rich-text-toolbar', async ({ host }) => {
    await host.evaluate(node => { (node as RichTextToolbar).activeFormats = ['bold'] })
    const bold = host.getByRole('button', { name: 'Bold', exact: true })
    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await host.evaluate(node => node.addEventListener('format', event => {
        node.setAttribute('data-last-format', (event as CustomEvent<{ format: string }>).detail.format)
    }))
    await bold.click()
    await expect(host).toHaveAttribute('data-last-format', 'bold')
    await host.evaluate(node => { (node as RichTextToolbar).disabled = true })
    await expect(bold).toBeDisabled()
})
