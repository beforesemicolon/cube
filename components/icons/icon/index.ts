import { register } from '../../core/Component.js'
import { fragment, sheet, editorCSS, aria } from '../../core/editor-dom.js'
import { createIcon, iconPaths } from '../registry.js'
import { IconBase } from './IconBase.js'
export class Icon extends IconBase {
    private svg?: SVGSVGElement
    render(): Node { this.svg=createIcon(this.name);return fragment(sheet(editorCSS+':host{display:inline-flex;line-height:1;font-size:var(--component-icon-size,16px)}[part=icon]{width:1em;height:1em}'),this.svg) }
    protected syncView():void { if(!this.svg)return;this.svg.querySelector('path')!.setAttribute('d',Object.hasOwn(iconPaths,this.name)?iconPaths[this.name]:'');const label=this.accessibleLabel||this.label;aria(this.svg,'role',label?'img':null);aria(this.svg,'aria-label',label);aria(this.svg,'aria-hidden',label?null:true) }
}
register('cb-icon',Icon)
export { IconBase }
export type { IconProps } from './IconBase.js'
