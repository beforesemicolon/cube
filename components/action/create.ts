import type { Button } from './button/index.js'
import type { IconButton } from './icon-button/index.js'
import './button/index.js'
import './icon-button/index.js'
export type ActionControl=Button|IconButton
function configure<T extends ActionControl>(control:T,part:string,handler:(event:CustomEvent)=>void,eventName:string):T{
    control.setAttribute('part',part)
    control.setAttribute('exportparts',`control:${part}-control,label:${part}-label,icon:${part}-icon,description:${part}-description`)
    Object.assign(control,{variant:'ghost',size:'sm'})
    control.addEventListener(eventName,event=>{event.stopPropagation();handler(event as CustomEvent)})
    return control
}
export function createButton(part:string,handler:(event:CustomEvent)=>void):Button{
    return configure(document.createElement('cb-button') as Button,part,handler,'cb-action')
}
export function createIconButton(part:string,icon:string,handler:(event:CustomEvent)=>void):IconButton{
    const control=configure(document.createElement('cb-icon-button') as IconButton,part,handler,'cb-action');control.icon=icon;return control
}
export function createPressedButton(part:string,handler:(event:CustomEvent)=>void):Button{
    const control=configure(document.createElement('cb-button') as Button,part,handler,'cb-change');control.pressed=false;return control
}
export function actionLabel(control:ActionControl,label:string):void{control.label=label;control.accessibleLabel=label;control.title=label}
