import { type Template, html } from '../../core/runtime.js'
import { BoxBase } from './BoxBase.js';
export class Box extends BoxBase {
    render(): Template {
        return html`<style part="styles">${':host{display:block;box-sizing:border-box;container-type:inline-size}:host([data-inline]){display:inline-block}:host([hidden]){display:none}'}</style><slot name="" part="content"></slot>`;
    }
}
export { BoxBase };
export type { BoxProps } from './BoxBase.js';
