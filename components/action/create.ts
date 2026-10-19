import type { Button } from './button/index.js'
export type ActionControl=Button
function configure<T extends ActionControl>(control:T,part:string,handler:(event:CustomEvent)=>void,eventName:string):T{
    const parts=part.trim().split(/\s+/).filter(Boolean)
    control.setAttribute('part',parts.join(' '))
    // These aliases are forwarded through the parent's shadow boundary. Parent
    // styles still target the child's own ::part(control), not the exported alias.
    control.setAttribute('exportparts',parts.flatMap(name=>[
        `control:${name}-control`,`label:${name}-label`,`button-label:${name}-label`,`icon:${name}-icon`,`description:${name}-description`,
    ]).join(','))
    Object.assign(control,{variant:'ghost',size:'sm'})
    control.addEventListener(eventName,event=>{event.stopPropagation();handler(event as CustomEvent)})
    return control
}
export function createButton(part:string,handler:(event:CustomEvent)=>void):Button{
    return configure(document.createElement('cb-button') as Button,part,handler,'action')
}
/** Internal composition primitive: shared button behavior with presentation owned by the parent component. */
export function createBareButton(part:string,handler:(event:CustomEvent)=>void):Button{
    const control=createButton(part,handler);control.toggleAttribute('data-bare',true);control.toggleAttribute('data-semantic-host',true);return control
}
export function createIconButton(part:string,icon:string,handler:(event:CustomEvent)=>void):Button{
    const control=configure(document.createElement('cb-button') as Button,part,handler,'action');control.icon=icon;control.iconOnly=true;return control
}
export function createPressedButton(part:string,handler:(event:CustomEvent)=>void):Button{
    const control=configure(document.createElement('cb-button') as Button,part,handler,'change');control.pressed=false;return control
}
export function actionLabel(control:ActionControl,label:string):void{control.label=label;control.accessibleLabel=label;control.title=label}
