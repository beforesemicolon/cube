import componentStylesheet from './styles.css?inline'
import { pick, isNot, or, html, state, unsafeHTML, type Template } from '../../core/runtime.js'

import { highlightCode } from '../../core/highlight.js'
import { scalarText } from '../../core/value.js'
import { CodePreviewBase } from './CodePreviewBase.js'

export class CodePreview extends CodePreviewBase {
    stylesheet = componentStylesheet

    private readonly copyStatus = state('')
    render(): Template {
        const highlighted = () => highlightCode(this.source(), scalarText(this.codeLanguage, 'plaintext'))
        return html`
            <figure part="root code-preview"><figcaption part="toolbar row">
                <span part="language">${pick(highlighted, "language")}</span>
                <cb-button part="copy" exportparts="control:copy-control,label:copy-label,button-label:copy-label,icon:copy-icon,description:copy-description" variant="ghost" label="${this.copyText}" disabled="${or(() => this.unavailable, isNot(this.source))}"
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
