import { register } from '../../core/Component.js'
import { buttonView } from '../button/view.js'
import { IconButtonBase } from './IconButtonBase.js'
export class IconButton extends IconButtonBase {
    private view?:ReturnType<typeof buttonView>
    render():Node{this.view=buttonView(this,e=>this.activate(e),'button',true);return this.view.root}
    protected actionElement(){return this.view?.control}
    protected syncView():void{this.view?.update()}
}
register('cb-icon-button',IconButton)
export { IconButtonBase }
