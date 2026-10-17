import { register } from '../../core/Component.js'
import { buttonView } from '../button/view.js'
import { bool } from '../../core/value.js'
import { ToggleButtonBase } from './ToggleButtonBase.js'
export class ToggleButton extends ToggleButtonBase {
    private view?:ReturnType<typeof buttonView>
    render():Node{this.view=buttonView(this,e=>this.activate(e));return this.view.root}
    protected actionElement(){return this.view?.control}
    protected syncView():void{this.view?.update();this.view?.control.setAttribute('aria-pressed',String(bool(this.pressed)))}
}
register('cb-toggle-button',ToggleButton)
export { ToggleButtonBase }
export type { ToggleButtonProps } from './ToggleButtonBase.js'
