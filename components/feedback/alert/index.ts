import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template } from '../../core/runtime.js'
import { messageView } from '../view.js'
import { AlertBase } from './AlertBase.js';
export class Alert extends AlertBase {
    stylesheet = componentStylesheet

    render(): Template { return messageView(this, 'alert'); }
}
export { AlertBase };
export type { AlertProps } from './AlertBase.js';

register('cb-alert', Alert)
