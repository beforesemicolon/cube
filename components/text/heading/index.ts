import { html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { scalarText } from '../../core/value.js'
import { HeadingBase } from './HeadingBase.js'

export class Heading extends HeadingBase {
    stylesheet = editorCSS + `
:host{display:block}[part~=root]{display:contents}[part~=heading],[part~=description]{margin:0}
:host([data-size=xs]) [part~=heading]{font-size:var(--component-heading-font-size-xs,.875rem)}
:host([data-size=sm]) [part~=heading]{font-size:var(--component-heading-font-size-sm,1rem)}
:host([data-size=md]) [part~=heading]{font-size:var(--component-heading-font-size-md,1.25rem)}
:host([data-size=lg]) [part~=heading]{font-size:var(--component-heading-font-size-lg,1.5rem)}
[part~=heading]{font-family:var(--typography-heading-font-family,inherit);font-weight:var(--typography-heading-font-weight,700);line-height:var(--typography-heading-line-height,1.2)}
[part~=description]{color:var(--color-muted-foreground);font-size:var(--component-heading-description-font-size,.875rem)}
`
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
            <p part="description" hidden="${() => !scalarText(this.props.description?.())}">${this.props.description}</p>
        </div>`
    }
}
export { HeadingBase }
export type { HeadingProps, HeadingVariant } from './HeadingBase.js'
