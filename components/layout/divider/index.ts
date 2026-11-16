import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template, html, when } from '../../core/runtime.js'
import { DividerBase } from './DividerBase.js';
export class Divider extends DividerBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<span part="divider"
            data-label="${when(this.hasLabel, '', null)}"
            data-label-position="${this.resolvedLabelPosition}"
            data-variant="${this.resolvedVariant}"
        ><span part="line before" aria-hidden="true"></span>
            ${when(this.hasLabel, html`<span part="label">${this.props.label}</span>`)}
            <span part="line after" aria-hidden="true"></span>
        </span>`
    }
}
export { DividerBase };
export type { DividerProps, DividerLabelPosition, DividerVariant } from './DividerBase.js';

register('cb-divider', Divider)
