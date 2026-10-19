import { type Template, html } from '../../core/runtime.js'
import { GridBase } from './GridBase.js';
export class Grid extends GridBase {
    render(): Template {
        return html`<style part="styles">${`:host{display:grid;box-sizing:border-box;min-inline-size:0}:host([hidden]){display:none}
:host([data-variant=masonry]){grid-template-rows:masonry}:host([data-variant=holy-grail]){min-block-size:100%}:host([data-variant=header-main-footer]){min-block-size:100%}`}</style><slot name="" part="content"></slot>`;
    }
}
export { GridBase };
export type { GridProps } from './GridBase.js';
