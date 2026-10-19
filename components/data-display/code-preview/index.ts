import { html, state, unsafeHTML, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { highlightCode } from '../../core/highlight.js'
import { scalarText } from '../../core/value.js'
import { CodePreviewBase } from './CodePreviewBase.js'
const css = editorCSS + `
:host{display:block;inline-size:100%;container-type:inline-size}
[part~=root]{margin:0;border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;background:var(--color-surface)}
[part~=toolbar]{justify-content:space-between;padding:var(--spacing-xs) var(--spacing-sm);border-block-end:1px solid var(--color-separator);background:var(--color-surface-muted)}
[part~=language]{color:var(--color-muted-foreground);font:600 11px/1.4 var(--typography-mono-font-family);letter-spacing:.04em;text-transform:lowercase}
[part~=copy]{flex:none}
[part~=pre]{margin:0;max-block-size:420px;overflow:auto;padding:var(--spacing-md);background:var(--color-surface)}
[part~=code]{color:var(--component-code-foreground,var(--color-foreground));font:400 var(--component-code-font-size,12px)/1.65 var(--typography-mono-font-family);white-space:pre;tab-size:2}
[part~=code]::selection,[part~=code] *::selection{background:var(--color-selection)}
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-type,.hljs-built_in{color:var(--component-code-keyword,var(--color-primary))}
.hljs-string,.hljs-attribute,.hljs-template-tag{color:var(--component-code-string,var(--color-success))}
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-variable.constant_{color:var(--component-code-number,var(--color-warning))}
.hljs-comment,.hljs-quote{color:var(--color-muted-foreground);font-style:italic}
.hljs-title,.hljs-section,.hljs-selector-id,.hljs-title.class_,.hljs-title.function_{color:var(--component-code-title,var(--color-signal-text));font-weight:600}
.hljs-attr,.hljs-property,.hljs-selector-class{color:var(--component-code-property,var(--color-signal-text))}
.hljs-regexp,.hljs-meta{color:var(--component-code-special,var(--color-danger))}
.hljs-variable,.hljs-template-variable,.hljs-params,.hljs-subst{color:var(--component-code-variable,var(--color-foreground))}
.hljs-operator,.hljs-punctuation{color:var(--component-code-punctuation,var(--color-muted-foreground))}
.hljs-addition{color:var(--color-success)}.hljs-deletion{color:var(--color-danger)}
.hljs-strong{font-weight:700}.hljs-emphasis{font-style:italic}
@container (max-width:360px){[part~=toolbar]{align-items:stretch;flex-direction:column}[part~=copy]{inline-size:100%}}
`;
export class CodePreview extends CodePreviewBase {
    private readonly copyStatus = state('')
    render(): Template {
        const highlighted = () => highlightCode(this.source(), scalarText(this.codeLanguage, 'plaintext'))
        return html`<style part="styles">${css}</style>
            <figure part="root code-preview"><figcaption part="toolbar row">
                <span part="language">${() => highlighted().language}</span>
                <cb-button part="copy" exportparts="control:copy-control,label:copy-label,button-label:copy-label,icon:copy-icon,description:copy-description" variant="ghost" label="${this.copyText}" disabled="${() => this.unavailable || !this.source()}"
                    onaction="${(event: Event) => { event.stopPropagation(); void this.copySource() }}"></cb-button>
            </figcaption>
            <pre part="pre" tabindex="0" role="region" aria-label="${this.accessibleName}"><code part="code" class="${() => 'language-' + highlighted().language}">${() => highlighted().language === 'plaintext' ? this.source() : unsafeHTML(highlighted().html)}</code></pre>
            <span part="status sr-only" role="status" aria-live="polite">${this.copyStatus[0]}</span></figure>`
    }
    private async copySource(): Promise<void> {
        const source = this.source()
        if (!source || this.unavailable) return
        try { await navigator.clipboard.writeText(source); this.copyStatus[1](this.copiedText()); this.emit('copy', { value: source }) }
        catch (error) { this.onError(error) }
    }
}
export { CodePreviewBase };
export type { CodePreviewProps } from './CodePreviewBase.js';
