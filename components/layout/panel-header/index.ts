import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { scalarText } from '../../core/value.js'
import { PanelHeaderBase } from './PanelHeaderBase.js'
const css = editorCSS + `
:host{display:block;min-inline-size:0}
[part~=header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-md,12px);min-block-size:var(--component-panel-header-height,44px);padding:var(--component-panel-header-padding,var(--spacing-sm,8px) var(--spacing-md,12px));border-block-end:1px solid var(--color-separator);background:var(--component-panel-header-background,var(--color-surface))}
[part~=copy]{min-inline-size:0}[part~=heading]{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650}[part~=description]:empty{display:none}
[part~=actions]{display:flex;align-items:center;gap:var(--spacing-xs,4px);flex:none}:host(:not([collapsible])) [part~=toggle]{display:none}
:host([collapsible]:not([expanded])) [part~=toggle]{rotate:-90deg}
`;
export class PanelHeader extends PanelHeaderBase {
    render(): Template {
        return html`<style part="styles">${css}</style>
            <header part="header">
                <div part="copy"><slot name="heading" part="heading">${() => scalarText(this.label)}</slot>
                    <p part="description" hidden="${() => !scalarText(this.description)}">${() => scalarText(this.description)}</p></div>
                <div part="actions"><slot name="actions" part="action-content"></slot>
                    <cb-button part="toggle" exportparts="control:toggle-control" variant="ghost" icon="down" icon-only="true"
                        hidden="${() => !this.isCollapsible()}" disabled="${() => this.unavailable}"
                        aria-expanded="${() => String(this.isExpanded())}" accessible-label="${this.toggleText}"
                        onaction="${this.toggleExpanded}"></cb-button>
                </div>
            </header>`
    }
    protected syncView(): void {
        this.toggleAttribute('collapsible', this.isCollapsible())
        this.toggleAttribute('expanded', this.isExpanded())
    }
}
export { PanelHeaderBase };
export type { PanelHeaderProps } from './PanelHeaderBase.js';
