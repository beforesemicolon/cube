import { expect } from '@playwright/test'
import type { RichTextEditor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-rich-text-editor', 'form--rich-text-editor', async ({ host }) => {
    await host.evaluate(node => { (node as RichTextEditor).value = 'Hello' })
    const editor = host.getByRole('textbox', { name: 'Rich text', exact: true })
    await expect(editor).toHaveText('Hello')
    await editor.focus(); await editor.press('ControlOrMeta+A')
    await host.getByRole('button', { name: 'Bold', exact: true }).click()
    await expect(host).toHaveJSProperty('value', '<strong>Hello</strong>')
    await host.evaluate(node => { (node as RichTextEditor).variant = 'box' })
    await expect(editor).toHaveAttribute('aria-multiline', 'true')
})
