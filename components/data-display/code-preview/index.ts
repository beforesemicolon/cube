import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import { CodePreviewBase } from './CodePreviewBase.js'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)

export class CodePreview extends CodePreviewBase {
    private codeNode?: HTMLElement
    private languageNode?: HTMLElement
    private copyButton?: HTMLButtonElement
    private statusNode?: HTMLElement

    render(): Node {
        const root = el('figure', 'root code-preview')
        const toolbar = el('figcaption', 'toolbar row')
        this.languageNode = el('span', 'language')
        this.copyButton = el('button', 'copy action')
        this.copyButton.type = 'button'
        this.copyButton.addEventListener('click', () => { void this.copySource() })
        toolbar.append(this.languageNode, this.copyButton)
        const pre = el('pre', 'pre')
        this.codeNode = el('code', 'code')
        pre.append(this.codeNode)
        this.statusNode = el('span', 'status sr-only')
        this.statusNode.setAttribute('role', 'status')
        this.statusNode.setAttribute('aria-live', 'polite')
        root.append(toolbar, pre, this.statusNode)
        return fragment(sheet(editorCSS + `
:host{display:block;inline-size:100%;container-type:inline-size}
[part~=root]{margin:0;border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;background:var(--color-surface)}
[part~=toolbar]{justify-content:space-between;padding:var(--spacing-xs) var(--spacing-sm);border-block-end:1px solid var(--color-separator);background:var(--color-surface-muted)}
[part~=language]{color:var(--color-muted-foreground);font-family:var(--typography-mono-font-family);text-transform:lowercase}
[part~=copy]{min-block-size:24px;padding:2px var(--spacing-sm);background:transparent}
[part~=pre]{margin:0;max-block-size:420px;overflow:auto;padding:var(--spacing-md);background:var(--color-surface)}
[part~=code]{font:400 var(--component-code-font-size,12px)/1.6 var(--typography-mono-font-family);white-space:pre;tab-size:2}
.hljs-keyword,.hljs-selector-tag,.hljs-literal{color:var(--component-code-keyword,var(--color-primary))}
.hljs-string,.hljs-attribute,.hljs-template-tag{color:var(--component-code-string,var(--color-success))}
.hljs-number,.hljs-symbol,.hljs-bullet{color:var(--component-code-number,var(--color-warning))}
.hljs-comment,.hljs-quote{color:var(--color-muted-foreground);font-style:italic}
.hljs-title,.hljs-section,.hljs-selector-id{color:var(--component-code-title,var(--color-signal-text));font-weight:600}
@container (max-width:360px){[part~=toolbar]{align-items:stretch;flex-direction:column}[part~=copy]{inline-size:100%}}
`), root)
    }

    protected syncView(): void {
        if (!this.codeNode || !this.languageNode || !this.copyButton || !this.statusNode) return
        const requested = scalarText(this.codeLanguage, 'plaintext').toLowerCase()
        const language = hljs.getLanguage(requested) ? requested : 'plaintext'
        const source = this.source()
        this.languageNode.textContent = language
        this.copyButton.textContent = this.copyText()
        this.copyButton.setAttribute('aria-label', this.copyText())
        this.copyButton.disabled = this.studioDisabled() || !source
        this.codeNode.className = `language-${language}`
        if (language === 'plaintext') this.codeNode.textContent = source
        else this.codeNode.innerHTML = hljs.highlight(source, { language, ignoreIllegals:true }).value
    }

    private async copySource(): Promise<void> {
        const source = this.source()
        if (!source || this.studioDisabled()) return
        try {
            await navigator.clipboard.writeText(source)
            if (this.statusNode) this.statusNode.textContent = this.copiedText()
            this.emit('cb-copy', { value:source })
        } catch (error) { this.onError(error) }
    }
}

register('cb-code-preview', CodePreview)
export { CodePreviewBase }
export type { CodePreviewProps } from './CodePreviewBase.js'
