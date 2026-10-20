import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { ActionBarBase } from './ActionBarBase.js'

export class ActionBar extends ActionBarBase {
    stylesheet = componentStylesheet
    render(): Template { return html`<div part="bar" role="toolbar" aria-label="${this.accessibleName}"><div part="start"><slot name="start" part="start-content"></slot></div><div part="actions"><slot part="content"></slot></div></div>` }
}
export { ActionBarBase }
export type { ActionBarProps } from './ActionBarBase.js'
