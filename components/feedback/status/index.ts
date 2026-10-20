import componentStylesheet from './styles.css?inline'
import { type Template } from '../../core/runtime.js'
import { messageView } from '../view.js'
import { StatusBase } from './StatusBase.js';
export class Status extends StatusBase {
    stylesheet = componentStylesheet

    render(): Template { return messageView(this, 'status'); }
}
export { StatusBase };
export type { StatusProps } from './StatusBase.js';
