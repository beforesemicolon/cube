import { register } from '../../core/Component.js'
import { fragment, sheet, slot } from '../../core/editor-dom.js'
import { RowBase } from './RowBase.js'

export class Row extends RowBase {
    render(): Node {
        return fragment(
            sheet(`:host{display:flex;box-sizing:border-box;min-inline-size:0;align-items:var(--cb-row-align,stretch);justify-content:var(--cb-row-justify,flex-start)}
:host([data-align=start]){align-items:flex-start}:host([data-align=center]){align-items:center}:host([data-align=end]){align-items:flex-end}:host([data-align=stretch]){align-items:stretch}:host([data-align=baseline]){align-items:baseline}
:host([data-justify=start]){justify-content:flex-start}:host([data-justify=center]){justify-content:center}:host([data-justify=end]){justify-content:flex-end}:host([data-justify=space-between]){justify-content:space-between}:host([data-justify=space-around]){justify-content:space-around}:host([data-justify=space-evenly]){justify-content:space-evenly}
:host([data-wrap]){flex-wrap:wrap}:host([data-reverse]){flex-direction:row-reverse}:host([data-collapsed]){flex-direction:column}:host([hidden]){display:none}`),
            slot('', '', 'content'),
        )
    }
}

register('cb-row', Row)
export { RowBase }
export type { RowProps, LayoutAlignment, LayoutDistribution, CollapsePoint } from './RowBase.js'
