import { register } from '../../core/Component.js'
import { fragment, sheet, slot } from '../../core/editor-dom.js'
import { ColBase } from './ColBase.js'

export class Col extends ColBase {
    render(): Node {
        return fragment(
            sheet(`:host{display:flex;flex-direction:column;box-sizing:border-box;min-inline-size:0}:host([data-reverse]){flex-direction:column-reverse}
:host([data-align=start]){align-items:flex-start}:host([data-align=center]){align-items:center}:host([data-align=end]){align-items:flex-end}:host([data-align=stretch]){align-items:stretch}:host([data-align=baseline]){align-items:baseline}
:host([data-justify=start]){justify-content:flex-start}:host([data-justify=center]){justify-content:center}:host([data-justify=end]){justify-content:flex-end}:host([data-justify=space-between]){justify-content:space-between}:host([data-justify=space-around]){justify-content:space-around}:host([data-justify=space-evenly]){justify-content:space-evenly}:host([hidden]){display:none}`),
            slot('', '', 'content'),
        )
    }
}

register('cb-col', Col)
export { ColBase }
export type { ColProps } from './ColBase.js'
