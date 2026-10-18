import type { ButtonBase, ButtonProps } from './ButtonBase.js'
import { el, fragment, sheet, slot, editorCSS, aria, uid } from '../../core/editor-dom.js'
import { createIcon, iconPaths } from '../../icons/registry.js'
import { bool, scalarText } from '../../core/value.js'
export const buttonCSS=editorCSS+`
:host{display:inline-block}[part~=control]{display:inline-flex;align-items:center;justify-content:center;gap:var(--spacing-sm,8px);text-decoration:none;vertical-align:middle;max-inline-size:100%;font-weight:500;min-inline-size:var(--component-button-min-width,72px);border-start-start-radius:var(--component-button-radius-start-start,var(--radius-sm,6px));border-start-end-radius:var(--component-button-radius-start-end,var(--radius-sm,6px));border-end-end-radius:var(--component-button-radius-end-end,var(--radius-sm,6px));border-end-start-radius:var(--component-button-radius-end-start,var(--radius-sm,6px))}
:host([data-variant=primary]) [part~=control]{background:var(--color-primary,#2563EB);color:var(--color-primary-foreground,#fff);border-color:transparent}
:host([data-variant=primary]) [part~=control]:hover:not(:disabled):not([aria-disabled=true]){background:var(--color-primary-hover,#1D50B3)}
:host([data-variant=outline]) [part~=control]{background:transparent}
:host([data-variant=ghost]) [part~=control]{border-color:transparent;background:transparent}
:host([data-variant=ghost]) [part~=control]:hover:not(:disabled):not([aria-disabled=true]){background:var(--color-active,#E8ECEE)}
:host([data-variant=destructive]) [part~=control]{color:var(--color-danger,#B4233C);background:var(--color-danger-soft,#FFF0F2);border-color:var(--color-danger,#B4233C)}
:host([data-variant=secondary]) [part~=control][aria-pressed=true],:host([data-variant=outline]) [part~=control][aria-pressed=true]{background:var(--color-selection,#EAF1FF);color:var(--color-signal-text,#1D50B3);border-color:var(--color-primary,#2563EB)}
:host([data-variant=ghost]) [part~=control][aria-pressed=true]{background:var(--color-selection,#EAF1FF);color:var(--color-signal-text,#1D50B3);border-color:transparent}
:host([data-variant=primary]) [part~=control][aria-pressed=true]{background:var(--color-primary-hover,#1D50B3);color:var(--color-primary-foreground,#fff);border-color:transparent;box-shadow:inset 0 0 0 2px color-mix(in srgb,currentColor 38%,transparent)}
:host([data-variant=destructive]) [part~=control][aria-pressed=true]{background:var(--color-danger,#B4233C);color:var(--color-danger-foreground,#fff);border-color:var(--color-danger,#B4233C);box-shadow:inset 0 0 0 2px color-mix(in srgb,currentColor 38%,transparent)}
[part~=spinner]{inline-size:var(--component-icon-size,16px);block-size:var(--component-icon-size,16px);border:2px solid currentColor;border-inline-end-color:transparent;border-radius:50%;animation:cb-spin .8s linear infinite}
[part~=label]{overflow:hidden;text-overflow:ellipsis}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px)}
@keyframes cb-spin{to{transform:rotate(360deg)}}
`
export function buttonView<P extends ButtonProps>(host:ButtonBase<P>,activate:(e:Event)=>void,tag:'button'|'a'='button',iconOnly=false){
    const control=el(tag,'control'),icon=createIcon(''),loading=el('span','spinner'),label=el('span','label'),content=slot(),suffix=slot('suffix','','suffix'),prefix=slot('prefix','','prefix')
    if(control instanceof HTMLButtonElement)control.type='button'
    label.append(content);control.append(prefix,icon,loading,label,suffix);control.addEventListener('click',activate)
    const desc=el('span','description');desc.id=uid('cb-button-help');desc.dataset.cbDescription='';desc.hidden=true
    const update=()=>{
        host.dataset.variant=['primary','secondary','outline','ghost','destructive'].includes(host.variant??'')?host.variant!:'secondary'
        const disabled=host.hasAttribute('data-disabled'),busy=bool(host.loading)
        if(control instanceof HTMLButtonElement)control.disabled=disabled
        else { aria(control,'aria-disabled',disabled?true:null);control.tabIndex=disabled?-1:0 }
        aria(control,'aria-busy',busy?true:null);aria(control,'aria-describedby',scalarText(host.description)?desc.id:null)
        aria(control,'aria-haspopup',host.popupType||null);aria(control,'aria-expanded',host.popupType?bool(host.popupExpanded):null);aria(control,'aria-controls',scalarText(host.popupControls)||null)
        aria(control,'aria-pressed',host.pressed===undefined?null:bool(host.pressed))
        const name=scalarText(host.accessibleLabel)||scalarText(host.label)
        aria(control,'aria-label',iconOnly?name:scalarText(host.accessibleLabel)||null)
        const glyph=Object.hasOwn(iconPaths,host.icon)?iconPaths[host.icon]:''
        content.textContent=scalarText(host.label);icon.toggleAttribute('hidden',busy||!glyph);icon.querySelector('path')!.setAttribute('d',glyph);loading.hidden=!busy
        if(iconOnly){label.setAttribute('part','label sr-only');control.style.paddingInline='var(--spacing-xs,4px)';control.style.minInlineSize='var(--cb-height)'}
        desc.textContent=scalarText(host.description);desc.hidden=!scalarText(host.description)
    }
    return {root:fragment(sheet(buttonCSS),control,desc),control,update}
}
