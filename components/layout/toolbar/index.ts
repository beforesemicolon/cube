import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { ToolbarBase } from './ToolbarBase.js'

export class Toolbar extends ToolbarBase {
    stylesheet = componentStylesheet
    render(): Template { return html`<div part="toolbar" role="toolbar" aria-orientation="horizontal" aria-label="${this.accessibleName}"><slot part="content"></slot></div>` }
}
export { ToolbarBase }
export type { ToolbarProps } from './ToolbarBase.js'

register('cb-toolbar', Toolbar)
