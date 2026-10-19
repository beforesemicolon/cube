import { register } from '../../core/Component.js'
import { fragment, sheet, el } from '../../core/editor-dom.js'
import { DividerBase } from './DividerBase.js'

export class Divider extends DividerBase {
    render(): Node {
        return fragment(
            sheet(`:host{display:block;align-self:stretch;min-block-size:1px;background:var(--color-separator,#dae0e4)}:host([data-stacked]){display:inline-block;inline-size:1px;min-inline-size:1px;min-block-size:1em}:host([hidden]){display:none}`),
            el('span', 'line'),
        )
    }
}

register('cb-divider', Divider)
export { DividerBase }
export type { DividerProps } from './DividerBase.js'
