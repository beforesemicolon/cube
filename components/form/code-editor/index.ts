import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import { highlightCode } from '../../core/highlight.js'
import { bool, scalarText } from '../../core/value.js'
import { CodeEditorBase } from './CodeEditorBase.js'

const syntaxCSS = `
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-type,.hljs-built_in{color:var(--component-code-keyword,var(--color-primary))}
.hljs-string,.hljs-attribute,.hljs-template-tag{color:var(--component-code-string,var(--color-success))}
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-variable.constant_{color:var(--component-code-number,var(--color-warning))}
.hljs-comment,.hljs-quote{color:var(--color-muted-foreground);font-style:italic}.hljs-title,.hljs-section,.hljs-selector-id,.hljs-title.class_,.hljs-title.function_{color:var(--component-code-title,var(--color-signal-text));font-weight:600}
.hljs-attr,.hljs-property,.hljs-selector-class{color:var(--component-code-property,var(--color-signal-text))}.hljs-regexp,.hljs-meta{color:var(--component-code-special,var(--color-danger))}
`
const css = editorCSS + syntaxCSS + `
:host{display:block;inline-size:min(100%,var(--component-code-editor-width,720px));min-inline-size:0}
[part~=field]{display:grid;gap:var(--spacing-xs,4px)}[part~=label]{font-weight:600}[part~=shell]{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=toolbar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);min-block-size:32px;padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator);background:var(--color-surface-muted)}
[part~=language],[part~=position]{color:var(--color-muted-foreground);font:600 11px/1.4 var(--typography-mono-font-family)}
[part~=editor]{display:grid;grid-template-columns:auto minmax(0,1fr);min-block-size:0;overflow:hidden}
[part~=gutter]{margin:0;padding:var(--spacing-sm,8px);border-inline-end:1px solid var(--color-separator);background:var(--color-surface-muted);color:var(--color-muted-foreground);font:400 var(--component-code-font-size,12px)/1.65 var(--typography-mono-font-family);text-align:end;user-select:none;white-space:pre}
[part~=editing-layer]{position:relative;min-inline-size:0;overflow:hidden}[part~=highlight],[part~=control]{font:400 var(--component-code-font-size,12px)/1.65 var(--typography-mono-font-family);tab-size:var(--code-tab-size,2);white-space:pre;margin:0;padding:var(--spacing-sm,8px);border:0;border-radius:0;min-block-size:var(--code-min-height);max-block-size:var(--code-max-height);overflow:auto}
[part~=highlight]{position:absolute;inset:0;pointer-events:none;color:var(--color-foreground)}[part~=control]{position:relative;inline-size:100%;resize:none;background:transparent;color:transparent;caret-color:var(--color-foreground);-webkit-text-fill-color:transparent;outline:0}
[part~=control]::selection{background:var(--color-selection);-webkit-text-fill-color:transparent}:host([data-wrap]) [part~=highlight],:host([data-wrap]) [part~=control]{white-space:pre-wrap;overflow-wrap:anywhere}
[part~=description],[part~=error]{margin:0}:host([data-invalid]) [part~=shell]{border-color:var(--color-danger)}
`

export class CodeEditor extends CodeEditorBase {
    private labelNode?: HTMLLabelElement
    private shell?: HTMLElement
    private languageNode?: HTMLElement
    private positionNode?: HTMLElement
    private gutter?: HTMLPreElement
    private highlight?: HTMLElement
    private control?: HTMLTextAreaElement
    private descriptionNode?: HTMLElement
    private errorNode?: HTMLElement

    render(): Node {
        const field = el('div', 'field')
        this.labelNode = el('label', 'label')
        this.shell = el('div', 'shell')
        const toolbar = el('div', 'toolbar')
        this.languageNode = el('span', 'language')
        this.positionNode = el('span', 'position')
        toolbar.append(this.languageNode, this.positionNode)
        const editor = el('div', 'editor')
        this.gutter = el('pre', 'gutter')
        const layer = el('div', 'editing-layer')
        this.highlight = el('pre', 'highlight')
        this.highlight.setAttribute('aria-hidden', 'true')
        this.control = el('textarea', 'control')
        this.control.id = uid('cb-code-editor')
        this.control.spellcheck = false
        this.control.autocapitalize = 'off'
        this.control.autocomplete = 'off'
        this.control.addEventListener('input', event => this.setValue(this.control?.value ?? '', event))
        this.control.addEventListener('change', event => this.setValue(this.control?.value ?? '', event, true))
        this.control.addEventListener('keydown', event => { if (!this.indent(event)) this.submit(event) })
        this.control.addEventListener('scroll', () => this.syncScroll())
        this.control.addEventListener('select', () => this.syncPosition())
        this.control.addEventListener('keyup', () => this.syncPosition())
        this.control.addEventListener('click', () => this.syncPosition())
        layer.append(this.highlight, this.control)
        editor.append(this.gutter, layer)
        this.shell.append(toolbar, editor)
        this.descriptionNode = el('p', 'description')
        this.errorNode = el('p', 'error')
        this.errorNode.setAttribute('role', 'alert')
        field.append(this.labelNode, this.shell, this.descriptionNode, this.errorNode)
        return fragment(sheet(css), field)
    }

    protected editorElement(): HTMLTextAreaElement | undefined { return this.control }
    protected syncView(): void {
        if (!this.labelNode || !this.shell || !this.languageNode || !this.positionNode || !this.gutter || !this.highlight || !this.control || !this.descriptionNode || !this.errorNode) return
        const value = this.sourceText()
        const selectionStart = this.control.selectionStart
        const selectionEnd = this.control.selectionEnd
        if (this.control.value !== value) this.control.value = value
        const highlighted = highlightCode(value, scalarText(this.language, 'plaintext'))
        this.languageNode.textContent = highlighted.language
        if (highlighted.language === 'plaintext') this.highlight.textContent = `${value}\n`
        else this.highlight.innerHTML = `${highlighted.html}\n`
        const lineCount = Math.max(1, value.split('\n').length)
        this.gutter.textContent = Array.from({ length: lineCount }, (_item, index) => String(index + 1)).join('\n')
        this.gutter.hidden = !bool(this.lineNumbers)
        this.control.placeholder = scalarText(this.placeholder)
        this.control.disabled = this.unavailable
        this.control.readOnly = bool(this.readOnly)
        this.control.required = bool(this.required) && !bool(this.readOnly)
        this.control.style.setProperty('--code-tab-size', String(this.normalizedTabSize()))
        this.style.setProperty('--code-min-height', `${this.normalizedMinLines() * 1.65}em`)
        this.style.setProperty('--code-max-height', `${this.normalizedMaxLines() * 1.65}em`)
        this.toggleAttribute('data-wrap', bool(this.wrap))
        this.labelNode.textContent = scalarText(this.label)
        this.labelNode.htmlFor = this.control.id
        this.labelNode.hidden = !scalarText(this.label)
        this.descriptionNode.textContent = scalarText(this.description)
        this.descriptionNode.hidden = !scalarText(this.description)
        this.syncForm(value)
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText)))
        this.errorNode.textContent = error ? this.validationMessage : ''
        this.errorNode.hidden = !error
        this.toggleAttribute('data-invalid', error)
        aria(this.control, 'aria-label', this.accessibleName())
        aria(this.control, 'aria-invalid', error ? true : null)
        const describedBy = [this.descriptionNode.hidden ? '' : this.descriptionNode.id ||= uid('cb-code-description'), error ? this.errorNode.id ||= uid('cb-code-error') : ''].filter(Boolean).join(' ')
        aria(this.control, 'aria-describedby', describedBy || null)
        this.control.setSelectionRange(Math.min(selectionStart, value.length), Math.min(selectionEnd, value.length))
        this.syncPosition()
        this.syncScroll()
    }

    private syncPosition(): void {
        if (!this.control || !this.positionNode) return
        const before = this.control.value.slice(0, this.control.selectionStart).split('\n')
        const line = before.length
        const column = (before.at(-1)?.length ?? 0) + 1
        this.positionNode.textContent = scalarText(this.positionLabel).replaceAll('{line}', String(line)).replaceAll('{column}', String(column))
    }
    private syncScroll(): void {
        if (!this.control || !this.highlight || !this.gutter) return
        this.highlight.scrollTop = this.control.scrollTop
        this.highlight.scrollLeft = this.control.scrollLeft
        this.gutter.scrollTop = this.control.scrollTop
    }
}

register('cb-code-editor', CodeEditor)
export { CodeEditorBase }
export type { CodeEditorProps, CodeEditorValue } from './CodeEditorBase.js'
