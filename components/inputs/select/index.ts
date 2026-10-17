import { register } from '../../core/Component.js'
import { SelectBase } from './SelectBase.js'
import { el,fragment,sheet,editorCSS,aria,uid } from '../../core/editor-dom.js'
import { bool,text } from '../../core/value.js'
export class Select extends SelectBase {
    private control?:HTMLSelectElement;private titleNode?:HTMLLabelElement;private descriptionNode?:HTMLElement;private errorNode?:HTMLElement;private optionsKey=''
    render():Node{
        this.optionsKey='';this.control=el('select','control');this.control.id=uid('cb-select')
        this.titleNode=el('label','label');this.titleNode.htmlFor=this.control.id
        this.descriptionNode=el('p','description');this.descriptionNode.id=this.control.id+'-description'
        this.errorNode=el('p','error');this.errorNode.id=this.control.id+'-error'
        this.control.addEventListener('change',event=>this.choose(bool(this.multiple)?Array.from(this.control!.selectedOptions,o=>o.value):this.control!.value,event))
        this.control.addEventListener('blur',()=>{this.validationShown=true;this.syncView()})
        return fragment(sheet(editorCSS+`:host{display:inline-block;max-inline-size:100%}[part=control]{display:block;inline-size:100%;min-inline-size:0;padding-inline:var(--spacing-sm,8px);color-scheme:inherit}[part=label]{display:block;margin-block-end:var(--spacing-xs,4px)}`),this.titleNode,this.control,this.descriptionNode,this.errorNode)
    }
    protected fieldElement(){return this.control}
    protected syncView():void{
        if(!this.control||!this.titleNode||!this.descriptionNode||!this.errorNode)return
        const options=this.normalizedOptions,multiple=bool(this.multiple),placeholder=text(this.placeholder)||this.ui('choose')
        const key=JSON.stringify([options,multiple,placeholder])
        if(key!==this.optionsKey){this.optionsKey=key;this.control.replaceChildren();const groups=new Map<string,HTMLOptGroupElement>()
            if(!multiple&&!options.some(o=>o.value==='')){const empty=el('option','option',placeholder);empty.value='';this.control.append(empty)}
            for(const option of options){const node=el('option','option',option.label);node.value=option.value;node.disabled=option.disabled
                if(option.group){let group=groups.get(option.group);if(!group){group=el('optgroup','group');group.label=option.group;groups.set(option.group,group);this.control.append(group)}group.append(node)}else this.control.append(node)
            }
        }
        this.control.multiple=multiple;this.control.disabled=this.unavailable;this.control.required=bool(this.required)&&!bool(this.readOnly)
        const selection=this.selection;Array.from(this.control.options).forEach(o=>o.selected=selection.includes(o.value));if(!multiple&&!selection.length)this.control.value=''
        this.control.setAttribute('aria-label',this.accessibleName('choose'));aria(this.control,'aria-readonly',bool(this.readOnly)?true:null)
        this.titleNode.textContent=text(this.label);this.titleNode.hidden=!text(this.label);this.descriptionNode.textContent=text(this.description);this.descriptionNode.hidden=!text(this.description)
        if(multiple){const data=new FormData();if(this.name)for(const value of selection)data.append(this.name,value);this.syncForm(data)}else this.syncForm(selection[0]??'')
        const error=!!this.validationMessage&&(this.validationShown||!!text(this.errorText));this.errorNode.textContent=error?this.validationMessage:'';this.errorNode.hidden=!error
        aria(this.control,'aria-invalid',error?true:null);aria(this.control,'aria-describedby',[text(this.description)?this.descriptionNode.id:'',error?this.errorNode.id:''].filter(Boolean).join(' ')||null)
    }
}
register('cb-select',Select)
export { SelectBase }
export type { SelectProps } from './SelectBase.js'
export type { SelectOption } from '../model.js'
