import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { pick, isNot, and, html, state, unsafeHTML, type Template } from '../../core/runtime.js'

import { highlightCode } from '../../core/highlight.js'
import { bool, scalarText } from '../../core/value.js'
import { CodeEditorBase } from './CodeEditorBase.js'

export class CodeEditor extends CodeEditorBase {
    stylesheet = componentStylesheet
    private readonly cursor = state({ line: 1, column: 1 })
    private get control(): HTMLTextAreaElement | undefined {
        const node = this.refs.control?.[0]
        return node instanceof HTMLTextAreaElement ? node : undefined
    }
    private get gutter(): HTMLElement | undefined {
        const node = this.refs.gutter?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    private get highlight(): HTMLElement | undefined {
        const node = this.refs.highlight?.[0]
        return node instanceof HTMLElement ? node : undefined
    }
    render(): Template {
        const error = () => Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText)))
        const highlighted = () => highlightCode(this.sourceText(), scalarText(this.language, 'plaintext'))
        const position = () => {
            const cursor = this.cursor[0]()
            return scalarText(this.positionLabel).replaceAll('{line}', String(cursor.line)).replaceAll('{column}', String(cursor.column))
        }
        return html`<div part="shell">
            <div part="toolbar"><span part="language">${pick(highlighted, "language")}</span><span part="position">${position}</span></div>
            <div part="editor">
                <pre ref="gutter" part="gutter" hidden="${isNot(this.props.lineNumbers)}">${() => Array.from({ length: Math.max(1, this.sourceText().split('\n').length) }, (_item, index) => String(index + 1)).join('\n')}</pre>
                <div part="editing-layer">
                    <pre ref="highlight" part="highlight" aria-hidden="true">${() => highlighted().language === 'plaintext' ? this.sourceText() + '\n' : unsafeHTML(highlighted().html + '\n')}</pre>
                    <textarea ref="control" part="control" spellcheck="false" autocapitalize="off" autocomplete="off"
                        value="${this.sourceText}" placeholder="${this.props.placeholder}" disabled="${() => this.unavailable}"
                        readonly="${this.props.readOnly}" required="${and(this.props.required, isNot(this.props.readOnly))}"
                        aria-label="${this.accessibleName}" aria-invalid="${() => error() ? 'true' : null}"
                        aria-description="${() => [scalarText(this.description), error() ? this.validationMessage : ''].filter(Boolean).join(' ') || null}" style="--code-tab-size:${this.normalizedTabSize}"
                        oninput="${(event: Event) => { if (!this.setValue(this.control?.value ?? '', event) && this.control) this.control.value = this.sourceText() }}"
                        onkeydown="${(event: KeyboardEvent) => { if (!this.editJson(event) && !this.indent(event)) this.submit(event) }}"
                        onscroll="${this.syncScroll}" onselect="${this.syncPosition}"
                        onkeyup="${this.syncPosition}" onclick="${this.syncPosition}"></textarea>
                </div>
            </div>
        </div>`.onUpdate(() => { this.syncPosition(); this.syncScroll() })
    }
    protected editorElement(): HTMLTextAreaElement | undefined { return this.control }
    protected syncView(): void {
        const control = this.control
        if (!control) return
        const value = this.sourceText()
        // A canceled parent edit can restore the same signal value before Markup
        // flushes. Reconcile that native edit, which never entered the template.
        if (control.value !== value) {
            const start = control.selectionStart, end = control.selectionEnd
            control.value = value
            control.setSelectionRange(Math.min(start, value.length), Math.min(end, value.length))
        }
        this.style.setProperty('--code-min-height', `${this.normalizedMinLines() * 1.65}em`)
        this.style.setProperty('--code-max-height', `${this.normalizedMaxLines() * 1.65}em`)
        this.toggleAttribute('data-wrap', bool(this.wrap))
        this.syncForm(value)
        const error = Boolean(this.validationMessage) && (this.validationShown || Boolean(scalarText(this.errorText)))
        this.toggleAttribute('data-invalid', error)
        this.syncPosition()
        this.syncScroll()
    }
    private syncPosition = (): void => {
        const control = this.control
        if (!control) return
        const before = control.value.slice(0, control.selectionStart).split('\n')
        const next = { line: before.length, column: (before.at(-1)?.length ?? 0) + 1 }
        const current = this.cursor[0]()
        if (current.line !== next.line || current.column !== next.column) this.cursor[1](next)
    }
    private syncScroll = (): void => {
        const control = this.control, highlight = this.highlight, gutter = this.gutter
        if (!control || !highlight || !gutter) return
        highlight.scrollTop = control.scrollTop
        highlight.scrollLeft = control.scrollLeft
        gutter.scrollTop = control.scrollTop
    }
}
export { CodeEditorBase }
export type { CodeEditorProps, CodeEditorValue } from './CodeEditorBase.js'

register('cb-code-editor', CodeEditor)
