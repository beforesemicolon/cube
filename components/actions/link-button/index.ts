import { register } from '../../core/Component.js'
import { buttonView } from '../button/view.js'
import { LinkButtonBase } from './LinkButtonBase.js'
export class LinkButton extends LinkButtonBase {
    private view?:ReturnType<typeof buttonView>
    render():Node{
        this.view=buttonView(this,e=>this.activate(e),'a');const a=this.view.control as HTMLAnchorElement;a.setAttribute('role','button');a.tabIndex=0
        let spaceDown=false
        a.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.repeat){e.preventDefault();a.click()}else if(e.key===' '){e.preventDefault();spaceDown=true}})
        a.addEventListener('keyup',e=>{if(e.key===' '&&spaceDown){e.preventDefault();spaceDown=false;a.click()}})
        a.addEventListener('blur',()=>spaceDown=false)
        return this.view.root
    }
    protected actionElement(){return this.view?.control}
    protected syncView():void{this.view?.update()}
}
register('cb-link-button',LinkButton)
export { LinkButtonBase }
