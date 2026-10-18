import { register } from '../../core/Component.js'
import { ButtonBase } from './ButtonBase.js'
import { buttonView } from './view.js'
export class Button extends ButtonBase {
    protected view?:ReturnType<typeof buttonView>
    render():Node { this.view=buttonView(this,e=>this.activate(e));return this.view.root }
    protected actionElement(){return this.view?.control}
    protected syncView():void{this.view?.update()}
}
register('cb-button',Button)
export { ButtonBase }
export type { ButtonProps } from './ButtonBase.js'
