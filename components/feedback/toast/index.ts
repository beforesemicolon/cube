import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template } from '../../core/runtime.js'
import { messageView } from '../view.js'
import { ToastBase } from './ToastBase.js';
export class Toast extends ToastBase {
    stylesheet = componentStylesheet

    render(): Template { return messageView(this, 'toast'); }
}
export { ToastBase };
export type { ToastProps } from './ToastBase.js';

register('cb-toast', Toast)
