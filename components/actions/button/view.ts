import type { ButtonBase } from './ButtonBase.js'
import { el, fragment, sheet, slot, editorCSS, aria, uid } from '../../core/editor-dom.js'
import { createIcon, iconPaths } from '../../icons/registry.js'
import { bool, text } from '../../core/value.js'
export const buttonCSS=editorCSS+`
:host{display:inline-block}[part~=control]{display:inline-flex;align-items:center;justify-content:center;gap:var(--spacing-sm,8px);text-decoration:none;vertical-align:middle;max-inline-size:100%;font-weight:500;min-inline-size:var(--cb-height)}
:host([data-variant=primary]) [part~=control]{background:var(--color-primary,#2563EB);color:var(--color-primary-foreground,#fff);border-color:transparent}
:host([data-variant=primary]) [part~=control]:hover{background:var(--color-primary-hover,#1D50B3)}
:host([data-variant=outline]) [part~=control]{background:transparent}
:host([data-variant=ghost]) [part~=control]{border-color:transparent;background:transparent}
:host([data-variant=ghost]) [part~=control]:hover{background:var(--color-active,#E8ECEE)}
:host([data-variant=destructive]) [part~=control]{color:var(--color-danger,#B4233C);background:var(--color-danger-soft,#FFF0F2);border-color:var(--color-danger,#B4233C)}
[part~=control][aria-pressed=true]{background:var(--color-selection,#EAF1FF);color:var(--color-signal-text,#1D50B3);border-color:var(--color-primary,#2563EB)}
[part~=spinner]{inline-size:16px;block-size:16px;border:2px solid currentColor;border-inline-end-color:transparent;border-radius:50%;animation:cb-spin .8s linear infinite}
[part~=label]{overflow:hidden;text-overflow:ellipsis}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px)}
@keyframes cb-spin{to{transform:rotate(360deg)}}
`
export function buttonView(host:ButtonBase,activate:(e:Event)=>void,tag:'button'|'a'='button',iconOnly=false){
    const control=el(tag,'control'),icon=createIcon(''),loading=el('span','spinner'),label=el('span','label'),content=slot(),suffix=slot('suffix','','suffix'),prefix=slot('prefix','','prefix')
    if(control instanceof HTMLButtonElement)control.type='button'
    label.append(content);control.append(prefix,icon,loading,label,suffix);control.addEventListener('click',activate)
    const desc=el('span','description');desc.id=uid('cb-button-help');desc.dataset.cbDescription='';desc.hidden=true
    const update=()=>{
        host.dataset.variant=['primary','secondary','outline','ghost','destructive'].includes(host.variant??'')?host.variant!:'secondary'
        const disabled=host.hasAttribute('data-disabled'),busy=bool(host.loading)
        if(control instanceof HTMLButtonElement)control.disabled=disabled
        else { aria(control,'aria-disabled',disabled?true:null);control.tabIndex=disabled?-1:0 }
        aria(control,'aria-busy',busy?true:null);aria(control,'aria-describedby',text(host.description)?desc.id:null)
        const name=text(host.accessibleLabel)||text(host.label)
        aria(control,'aria-label',iconOnly?(name||host.ui('action')):text(host.accessibleLabel)||null)
        content.textContent=text(host.label)||host.ui('action');icon.toggleAttribute('hidden',busy||!iconPaths[host.icon]);icon.querySelector('path')!.setAttribute('d',iconPaths[host.icon]??'');loading.hidden=!busy
        if(iconOnly){label.setAttribute('part','label sr-only');control.style.paddingInline='var(--spacing-xs,4px)'}
        desc.textContent=text(host.description);desc.hidden=!text(host.description)
    }
    return {root:fragment(sheet(buttonCSS),control,desc),control,update}
}
