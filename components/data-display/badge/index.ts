import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'
import { BadgeBase } from './BadgeBase.js'
export class Badge extends BadgeBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<span
            part="display token badge"
            data-tone="${() => this.badgeTone}"
            role="status"
            aria-label="${() => this.accessibleName() || null}"
            ><slot part="content">${() => this.badgeText}</slot></span
        >`
    }
}
export { BadgeBase }
export type { BadgeProps, BadgeTone } from './BadgeBase.js'

register('cb-badge', Badge)
