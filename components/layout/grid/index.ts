import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'
import { GridBase } from './GridBase.js';
export class Grid extends GridBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<slot name="" part="content"></slot>`;
    }
}
export { GridBase };
export type { GridProps } from './GridBase.js';
