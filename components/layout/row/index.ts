import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'
import { RowBase } from './RowBase.js';
export class Row extends RowBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<slot name="" part="content"></slot>`;
    }
}
export { RowBase };
export type { RowProps, LayoutAlignment, LayoutDistribution, LayoutSpacing, CollapsePoint } from './RowBase.js';
