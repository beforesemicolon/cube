import '../code-editor/index.js'
import type { CodeEditor } from '../code-editor/index.js'
import { actionLabel, createButton } from '../../action/create.js'
import type { Button } from '../../action/button/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { bool, scalarText } from '../../core/value.js'
import { JsonEditorBase } from './JsonEditorBase.js'

const css = editorCSS + `
:host{display:block;inline-size:min(100%,var(--component-json-editor-width,720px))}[part~=root]{display:grid;gap:var(--spacing-xs,4px)}
[part~=toolbar]{display:flex;align-items:center;justify-content:flex-end;gap:var(--spacing-sm,8px)}[part~=status]{margin-inline-end:auto;color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px)}
[part~=status][data-invalid]{color:var(--color-danger)}[part~=editor]{display:block;inline-size:100%}
`

export class JsonEditor extends JsonEditorBase {
    private editor?: CodeEditor
    private formatButton?: Button
    private status?: HTMLElement
    render(): Node {
        const root = el('div', 'root')
        const toolbar = el('div', 'toolbar')
        this.status = el('span', 'status')
        this.status.setAttribute('role', 'status')
        this.formatButton = createButton('format', event => this.format(event))
        toolbar.append(this.status, this.formatButton)
        this.editor = document.createElement('cb-code-editor') as CodeEditor
        this.editor.setAttribute('part', 'editor')
        this.editor.addEventListener('cb-before-change', event => event.stopPropagation())
        this.editor.addEventListener('cb-input', event => {
            event.stopPropagation()
            this.setValue(scalarText((event as CustomEvent<{ value: string }>).detail.value), event)
        })
        this.editor.addEventListener('cb-change', event => {
            event.stopPropagation()
            this.setValue(scalarText((event as CustomEvent<{ value: string }>).detail.value), event, true)
        })
        root.append(toolbar, this.editor)
        return fragment(sheet(css), root)
    }
    protected nestedEditor(): HTMLElement | undefined { return this.editor }
    protected syncView(): void {
        if (!this.editor || !this.formatButton || !this.status) return
        const error = this.syncJsonForm()
        Object.assign(this.editor, {
            label: scalarText(this.label), accessibleLabel: scalarText(this.accessibleLabel), description: scalarText(this.description),
            value: this.sourceText(), language: 'json', placeholder: scalarText(this.placeholder), lineNumbers: bool(this.lineNumbers),
            wrap: bool(this.wrap), positionLabel: scalarText(this.positionLabel), disabled: this.unavailable, readOnly: bool(this.readOnly),
            required: bool(this.required), errorText: error,
        })
        actionLabel(this.formatButton, scalarText(this.formatLabel))
        this.formatButton.disabled = this.unavailable || bool(this.readOnly) || !this.sourceText()
        const invalidLabel = scalarText(this.invalidLabel)
        this.status.textContent = error
            ? error === invalidLabel ? invalidLabel.replaceAll('{error}', '').trim() : invalidLabel ? invalidLabel.replaceAll('{error}', error) : error
            : scalarText(this.validLabel)
        this.status.toggleAttribute('data-invalid', Boolean(error))
    }

    focus(options?: FocusOptions): void { this.editor?.focus(options) }
}

register('cb-json-editor', JsonEditor)
export { JsonEditorBase }
export type { JsonEditorProps, JsonPrimitive, JsonValue, JsonValidator } from './JsonEditorBase.js'
