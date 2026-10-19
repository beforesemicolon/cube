import { css as componentStyles, type Template, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { iconPaths } from '../registry.js';
import { IconBase } from './IconBase.js';
export class Icon extends IconBase {
    stylesheet = componentStyles`${editorCSS + ':host{display:inline-flex;line-height:1;font-size:var(--component-icon-size,16px)}[part=icon]{width:1em;height:1em}'}`
    render(): Template {
        const label = () => this.props.accessibleLabel?.() || this.props.label?.() || ''
        return html`<svg part="icon" viewBox="0 0 24 24" focusable="false"
            role="${() => label() ? 'img' : null}" aria-label="${() => label() || null}"
            aria-hidden="${() => label() ? null : 'true'}">
            <path part="path" d="${() => iconPaths[this.props.name?.() ?? ''] ?? ''}" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`
    }
}
export { IconBase };
export type { IconProps } from './IconBase.js';
