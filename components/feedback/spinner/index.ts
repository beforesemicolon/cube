import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template } from '../../core/runtime.js'
import { spinnerView } from '../view.js'
import { SpinnerBase } from './SpinnerBase.js'
export class Spinner extends SpinnerBase {
    stylesheet = componentStylesheet

    render(): Template {
        return spinnerView(this)
    }
}
export { SpinnerBase }
export type { SpinnerProps } from './SpinnerBase.js'

register('cb-spinner', Spinner)
