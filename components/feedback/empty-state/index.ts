import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, isNot, or, type Template } from '../../core/runtime.js'

import { EmptyStateBase } from './EmptyStateBase.js';
export class EmptyState extends EmptyStateBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<cb-col part="root" width="100%" padding="32px 24px" align="center" gap="20px">
            <cb-row part="icon-box" width="64px" height="64px" radius="16px" background="var(--color-selection)"
                align="center" justify="center" hidden=${isNot(or(this.props.icon, this.props.iconSrc))}>
                <cb-icon part="icon" name=${this.props.icon} src=${this.props.iconSrc} decorative></cb-icon>
            </cb-row>
            <cb-heading part="heading" variant="h2" size=${this.props.size} label=${this.props.heading}
                description=${this.props.description} hidden=${isNot(this.props.heading)}></cb-heading>
            <slot part="body"></slot>
        </cb-col>`
    }
}
export { EmptyStateBase };
export type { EmptyStateProps } from './EmptyStateBase.js';

register('cb-empty-state', EmptyState)
