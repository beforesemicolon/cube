import { css as componentStyles, type Template, html } from '../../core/runtime.js'
import { GridBase } from './GridBase.js';
export class Grid extends GridBase {
    stylesheet = componentStyles`${`:host{display:grid;box-sizing:border-box;min-inline-size:0}:host([hidden]){display:none}
:host([data-variant=masonry]){grid-template-rows:masonry}:host([data-variant=holy-grail]){min-block-size:100%}:host([data-variant=header-main-footer]){min-block-size:100%}`}`

    render(): Template {
        return html`<slot name="" part="content"></slot>`;
    }
}
export { GridBase };
export type { GridProps } from './GridBase.js';
