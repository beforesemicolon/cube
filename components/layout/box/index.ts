import { register } from '../../core/Component.js'
import { sheet, slot, fragment } from '../../core/editor-dom.js'
import { BoxBase } from './BoxBase.js'

export class Box extends BoxBase {
    render(): Node {
        return fragment(
            sheet(':host{display:block;box-sizing:border-box;container-type:inline-size}:host([data-inline]){display:inline-block}:host([hidden]){display:none}'),
            slot('', '', 'content'),
        )
    }
}

register('cb-box', Box)
export { BoxBase }
export type { BoxProps } from './BoxBase.js'
