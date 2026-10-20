import componentStylesheet from './styles.css?inline'
import { html, repeat, type Template } from '../../core/runtime.js'

import { scalarText } from '../../core/value.js'
import { ShortcutBase } from './ShortcutBase.js'

export class Shortcut extends ShortcutBase {
    stylesheet = componentStylesheet
    render(): Template {
        return html`<span part="shortcut" aria-label="${() => scalarText(this.props.accessibleLabel?.()) || this.keyList().join(' + ')}">
            ${repeat(this.keyList, key => html`<kbd part="key">${key}</kbd>`, { key: (_key, index) => index })}
        </span>`
    }
}
export { ShortcutBase }
export type { ShortcutProps } from './ShortcutBase.js'
