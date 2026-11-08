import { expect } from '@playwright/test'
import type { Template } from '../../core/runtime.js'
import type { RichTextEditorBase, RichTextEditorProps } from './base.js'
import type { RichTextEditor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

interface ExtendedRichTextProps extends RichTextEditorProps {
    documentMode?: 'message' | 'template'
}

// Typecheck the extension contract without importing a DOM class in Playwright's Node runner.
function extendEditor(Base: typeof RichTextEditorBase) {
    abstract class ExtendedRichTextEditor extends Base<ExtendedRichTextProps> {
        documentMode: ExtendedRichTextProps['documentMode'] = 'message'
        protected cleanValue = (value: string): string => value
        abstract render(): Template
    }
    return ExtendedRichTextEditor
}

void extendEditor

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
