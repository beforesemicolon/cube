import { register } from '../../core/Component.js'
import { fragment, sheet, slot } from '../../core/editor-dom.js'
import { GridBase } from './GridBase.js'

export class Grid extends GridBase {
    render(): Node { return fragment(sheet(':host{display:grid;box-sizing:border-box;min-inline-size:0}:host([hidden]){display:none}'), slot('', '', 'content')) }
}

register('cb-grid', Grid)
export { GridBase }
export type { GridProps } from './GridBase.js'
