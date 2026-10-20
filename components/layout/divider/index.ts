import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'
import { DividerBase } from './DividerBase.js';
export class Divider extends DividerBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<span part="${'line'}"></span>`;
    }
}
export { DividerBase };
export type { DividerProps } from './DividerBase.js';
