import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'
import { BoxBase } from './BoxBase.js';
export class Box extends BoxBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<slot name="" part="content"></slot>`;
    }
}
export { BoxBase };
export type { BoxProps } from './BoxBase.js';
