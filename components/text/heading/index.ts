import componentStylesheet from './styles.css?inline'
import { isNot, html, type Template } from '../../core/runtime.js'

import { HeadingBase } from './HeadingBase.js'

export class Heading extends HeadingBase {
    stylesheet = componentStylesheet
    render(): Template {
        return html`<div part="root">
            ${() => {
                switch (this.props.variant?.()) {
                    case 'h3': return html`<h3 part="heading"><slot part="content">${this.props.label}</slot></h3>`
                    case 'h4': return html`<h4 part="heading"><slot part="content">${this.props.label}</slot></h4>`
                    case 'h5': return html`<h5 part="heading"><slot part="content">${this.props.label}</slot></h5>`
                    case 'h6': return html`<h6 part="heading"><slot part="content">${this.props.label}</slot></h6>`
                    default: return html`<h2 part="heading"><slot part="content">${this.props.label}</slot></h2>`
                }
            }}
            <p part="description" hidden="${isNot(this.props.description)}">${this.props.description}</p>
        </div>`
    }
}
export { HeadingBase }
export type { HeadingProps, HeadingVariant } from './HeadingBase.js'
