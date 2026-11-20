import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, when, type Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { messageView } from '../view.js'
import { AlertBase } from './AlertBase.js';
export class Alert extends AlertBase {
    stylesheet = componentStylesheet

    render(): Template {
        return messageView(this, 'alert', html`${when(
            () => bool(this.dismissible),
            html`<cb-button
                part="dismiss"
                icon="close"
                icon-only
                size="xs"
                variant="ghost"
                accessible-label=${() => scalarText(this.dismissLabel).trim() || 'Dismiss alert'}
                disabled=${() => this.unavailable}
                onaction=${(event: Event) => {
                    event.stopPropagation()
                    this.dismiss(event)
                }}
            ></cb-button>`
        )}`)
    }
}
export { AlertBase };
export type { AlertProps } from './AlertBase.js';

register('cb-alert', Alert)
