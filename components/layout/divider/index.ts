import { css as componentStyles, type Template, html } from '../../core/runtime.js'
import { DividerBase } from './DividerBase.js';
export class Divider extends DividerBase {
    stylesheet = componentStyles`${`:host{display:block;align-self:stretch;min-block-size:1px;background:var(--color-separator,#dae0e4)}:host([data-stacked]){display:inline-block;inline-size:1px;min-inline-size:1px;min-block-size:1em}:host([hidden]){display:none}`}`

    render(): Template {
        return html`<span part="${'line'}"></span>`;
    }
}
export { DividerBase };
export type { DividerProps } from './DividerBase.js';
