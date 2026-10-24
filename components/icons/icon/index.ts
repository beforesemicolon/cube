import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template, html, when } from '../../core/runtime.js'

import { iconPaths } from '../registry.js';
import { IconBase } from './IconBase.js';
import { iconSource } from '../source.js'
export class Icon extends IconBase {
    stylesheet = componentStylesheet
    render(): Template {
        const label = () => this.props.accessibleLabel?.() || this.props.label?.() || ''
        const source = () => iconSource(this.src, this.baseURI)
        return html`<span part="icon"
            role="${() => label() ? 'img' : null}" aria-label="${() => label() || null}"
            aria-hidden="${() => label() ? null : 'true'}">
            <slot>${when(source, html`<img part="image" src=${source} alt="" aria-hidden="true" draggable="false">`,
                html`<svg part="glyph" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path part="path" d="${() => iconPaths[this.props.name?.() ?? ''] ?? ''}" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>`)}</slot>
        </span>`
    }
}
export { IconBase };
export type { IconProps } from './IconBase.js';

register('cb-icon', Icon)
