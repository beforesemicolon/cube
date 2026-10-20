import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'
import { ColBase } from './ColBase.js';
export class Col extends ColBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<slot name="" part="content"></slot>`;
    }
}
export { ColBase };
export type { ColProps } from './ColBase.js';
