import { css as componentStyles, pick, isNot, and, html, state, unsafeHTML, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { highlightCode } from '../../core/highlight.js'
import { bool, scalarText } from '../../core/value.js'
import { CodeEditorBase } from './CodeEditorBase.js'

const syntaxCSS = `
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-type,.hljs-built_in{color:var(--component-code-keyword,var(--color-primary))}
.hljs-string,.hljs-attribute,.hljs-template-tag{color:var(--component-code-string,var(--color-success))}
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-variable.constant_{color:var(--component-code-number,var(--color-warning))}
.hljs-comment,.hljs-quote{color:var(--color-muted-foreground);font-style:italic}.hljs-title,.hljs-section,.hljs-selector-id,.hljs-title.class_,.hljs-title.function_{color:var(--component-code-title,var(--color-signal-text));font-weight:600}
.hljs-attr,.hljs-property,.hljs-selector-class{color:var(--component-code-property,var(--color-signal-text))}.hljs-regexp,.hljs-meta{color:var(--component-code-special,var(--color-danger))}
`;
const css = editorCSS + syntaxCSS + `
:host{display:block;inline-size:var(--component-code-editor-width,720px);max-inline-size:100%;min-inline-size:min(100%,var(--component-code-editor-min-width,320px))}
[part~=shell]{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface)}
[part~=toolbar]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px);min-block-size:32px;padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border-block-end:1px solid var(--color-separator);background:var(--color-surface-muted)}
[part~=language],[part~=position]{color:var(--color-muted-foreground);font:600 11px/1.4 var(--typography-mono-font-family)}
[part~=editor]{display:grid;grid-template-columns:auto minmax(0,1fr);min-block-size:0;overflow:hidden}
[part~=gutter]{margin:0;padding:var(--spacing-sm,8px);border-inline-end:1px solid var(--color-separator);background:var(--color-surface-muted);color:var(--color-muted-foreground);font:400 var(--component-code-font-size,12px)/1.65 var(--typography-mono-font-family);text-align:end;user-select:none;white-space:pre}
[part~=editing-layer]{position:relative;min-inline-size:0;overflow:hidden}[part~=highlight],[part~=control]{font:400 var(--component-code-font-size,12px)/1.65 var(--typography-mono-font-family);tab-size:var(--code-tab-size,2);white-space:pre;margin:0;padding:var(--spacing-sm,8px);border:0;border-radius:0;min-block-size:var(--code-min-height);max-block-size:var(--code-max-height);overflow:auto}
[part~=highlight]{position:absolute;inset:0;pointer-events:none;color:var(--color-foreground)}[part~=control]{position:relative;inline-size:100%;resize:none;background:transparent;color:transparent;caret-color:var(--color-foreground);-webkit-text-fill-color:transparent;outline:0}
[part~=control]::selection{background:var(--component-code-selection-background,var(--color-selection));color:var(--component-code-selection-foreground,var(--color-foreground));-webkit-text-fill-color:var(--component-code-selection-foreground,var(--color-foreground));text-shadow:none}:host([data-wrap]) [part~=highlight],:host([data-wrap]) [part~=control]{white-space:pre-wrap;overflow-wrap:anywhere}
:host([data-invalid]) [part~=shell]{border-color:var(--color-danger)}
`;
export class CodeEditor extends CodeEditorBase {
    stylesheet = componentStyles`${css}`
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
