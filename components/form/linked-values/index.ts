import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool, finite } from '../../core/value.js'
import { LinkedValuesBase } from './LinkedValuesBase.js'
const css = editorCSS + `
:host{display:block;inline-size:var(--component-linked-values-width,420px);max-inline-size:100%;min-inline-size:min(100%,var(--component-linked-values-min-width,320px))}[part~=group]{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:end;gap:var(--spacing-xs,4px);inline-size:100%;min-inline-size:0}
[part~=value-field]{display:grid;gap:var(--spacing-xs,4px);min-inline-size:0}[part~=value-label]{color:var(--color-muted-foreground);font-size:var(--component-caption-font-size,11px);font-weight:600}
[part~=first],[part~=second]{display:block;min-inline-size:0;--component-studio-control-width:100%;--component-studio-control-min-width:0px}[part~=link]{margin-block-end:1px}
@container(max-width:300px){[part~=group]{grid-template-columns:minmax(0,1fr) auto}[part~=second-field]{grid-column:1}[part~=link]{grid-column:2;grid-row:1/3;align-self:center}}
`;
export class LinkedValues extends LinkedValuesBase {
    render(): Template {
        return html`<style part="styles">${css}</style><div part="group" role="group" aria-label="${this.accessibleName}">
            <label part="value-field first-field"><span part="value-label first-label" onclick="${() => this.focus()}">${this.props.firstLabel}</span>
                <cb-number-input ref="first" part="first" label="${this.props.firstLabel}" accessible-label="${this.props.firstLabel}"
                    value="${() => finite(this.firstValue)}" min="${this.props.min}" max="${this.props.max}" step="${this.props.step}"
                    disabled="${() => this.unavailable}" onchange="${(event: CustomEvent<{ value: number }>) => { event.stopPropagation(); this.setFirst(finite(event.detail.value), event) }}"></cb-number-input></label>
            <cb-button part="link" exportparts="control:link-control,label:link-label,button-label:link-label,icon:link-icon,description:link-description" accessible-label="${this.toggleLabel}" title="${this.toggleLabel}" pressed="${() => bool(this.linked)}"
                icon="${() => bool(this.linked) ? 'link' : 'unlink'}" icon-only="true" variant="ghost" disabled="${() => this.unavailable}"
                onchange="${(event: CustomEvent<{ pressed: boolean }>) => { event.stopPropagation(); this.setLinked(bool(event.detail.pressed), event) }}"></cb-button>
            <label part="value-field second-field"><span part="value-label second-label" onclick="${() => { const second = this.refs.second?.[0]; if (second instanceof HTMLElement) second.focus() }}">${this.props.secondLabel}</span>
                <cb-number-input ref="second" part="second" label="${this.props.secondLabel}" accessible-label="${this.props.secondLabel}"
                    value="${() => finite(this.secondValue)}" min="${this.props.min}" max="${this.props.max}" step="${this.props.step}"
                    disabled="${() => this.unavailable}" onchange="${(event: CustomEvent<{ value: number }>) => { event.stopPropagation(); this.setSecond(finite(event.detail.value), event) }}"></cb-number-input></label>
        </div>`
    }
    protected syncView(): void { this.syncFormValues() }
    focus(options?: FocusOptions): void { const first = this.refs.first?.[0]; if (first instanceof HTMLElement) first.focus(options) }
}
export { LinkedValuesBase };
export type { LinkedValuesProps } from './LinkedValuesBase.js';
