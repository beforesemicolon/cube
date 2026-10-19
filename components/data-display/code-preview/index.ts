import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { highlightCode } from '../../core/highlight.js';
import { actionLabel, createButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import { scalarText } from '../../core/value.js';
import { CodePreviewBase } from './CodePreviewBase.js';
export class CodePreview extends CodePreviewBase {
    private codeNode?: HTMLElement;
    private languageNode?: HTMLElement;
    private copyButton?: Button;
    private statusNode?: HTMLElement;
    private preNode?: HTMLPreElement;
    render(): Template {
        const root = element('figure', { attributes: { part: 'root code-preview' } }) as HTMLElement;
        const toolbar = element('figcaption', { attributes: { part: 'toolbar row' } }) as HTMLElement;
        this.languageNode = element('span', { attributes: { part: 'language' } }) as HTMLSpanElement;
        this.copyButton = createButton('copy', () => { void this.copySource(); });
        toolbar.append(this.languageNode, this.copyButton);
        this.preNode = element('pre', { attributes: { part: 'pre' } }) as HTMLPreElement;
        this.preNode.tabIndex = 0;
        this.preNode.setAttribute('role', 'region');
        this.codeNode = element('code', { attributes: { part: 'code' } }) as HTMLElement;
        this.preNode.append(this.codeNode);
        this.statusNode = element('span', { attributes: { part: 'status sr-only' } }) as HTMLSpanElement;
        this.statusNode.setAttribute('role', 'status');
        this.statusNode.setAttribute('aria-live', 'polite');
        root.append(toolbar, this.preNode, this.statusNode);
        return html`<style part="styles">${editorCSS + `
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
`}</style>${root}`;
    }
    protected syncView(): void {
        if (!this.codeNode || !this.languageNode || !this.copyButton || !this.statusNode || !this.preNode)
            return;
        const highlighted = highlightCode(this.source(), scalarText(this.codeLanguage, 'plaintext'));
        const language = highlighted.language;
        const source = this.source();
        this.languageNode.textContent = language;
        aria(this.preNode, 'aria-label', this.accessibleName());
        actionLabel(this.copyButton, this.copyText());
        this.copyButton.disabled = this.unavailable || !source;
        this.codeNode.className = `language-${language}`;
        if (language === 'plaintext')
            this.codeNode.textContent = source;
        else
            this.codeNode.innerHTML = highlighted.html;
    }
    private async copySource(): Promise<void> {
        const source = this.source();
        if (!source || this.unavailable)
            return;
        try {
            await navigator.clipboard.writeText(source);
            if (this.statusNode)
                this.statusNode.textContent = this.copiedText();
            this.emit('copy', { value: source });
        }
        catch (error) {
            this.onError(error);
        }
    }
}
export { CodePreviewBase };
export type { CodePreviewProps } from './CodePreviewBase.js';
