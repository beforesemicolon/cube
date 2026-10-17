import { token as v } from '../theme/tokens.js'
import { el, sheet } from './dom.js'
export { el, sheet }
let nextId = 0
export function uid(prefix = 'cb'): string { return `${prefix}-${++nextId}` }
export function fragment(...nodes: Node[]): DocumentFragment { const f=document.createDocumentFragment(); f.append(...nodes); return f }
export function slot(name = '', fallback = '', part = 'content'): HTMLSlotElement {
    const node = el('slot', part); if(name)node.name=name; if(fallback)node.textContent=fallback; return node
}
export function aria(node: Element, name: string, value: string | number | boolean | null | undefined): void {
    if(value === null || value === undefined || value === '')node.removeAttribute(name); else node.setAttribute(name,String(value))
}
export function safeHref(value: unknown, base = typeof document === 'undefined' ? 'https://example.invalid/' : document.baseURI): string {
    if(typeof value !== 'string' || !value.trim())return ''
    try { const url=new URL(value,base); return ['http:','https:','mailto:','tel:'].includes(url.protocol)?value:'' } catch { return '' }
}
export const editorCSS = `
:host{display:inline-block;max-inline-size:100%;color:${v('--color-foreground')};font:400 var(--component-font-size,12px)/var(--component-line-height,1.4) ${v('--typography-body-font-family')};--cb-height:var(--component-control-height,28px);vertical-align:middle}
:host([data-size=xs]){--cb-height:var(--component-control-height-xs,24px)}
:host([data-size=sm]){--cb-height:var(--component-control-height-sm,28px)}
:host([data-size=md]){--cb-height:var(--component-control-height-md,36px)}
:host([data-size=lg]){--cb-height:var(--component-control-height-lg,44px)}
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
button,input,select,textarea{font:inherit;color:inherit}
button,a,input,select,textarea,[tabindex]{-webkit-tap-highlight-color:transparent}
button,[part~=control]{min-block-size:var(--cb-height);border:1px solid ${v('--color-border')};border-radius:${v('--radius-sm')};background:${v('--color-surface-muted')};padding:var(--spacing-xs,4px) var(--spacing-md,12px);margin:0}
button,a{touch-action:manipulation}
button{cursor:pointer;white-space:nowrap}
button:hover:not(:disabled){background:${v('--color-active')}}
button:active:not(:disabled){background:${v('--color-track')}}
button:disabled,[aria-disabled=true]{cursor:not-allowed;color:${v('--color-muted-foreground')}}
button:disabled{opacity:var(--component-disabled-opacity,.5)}
:focus-visible{outline:var(--component-focus-width,2px) solid ${v('--color-focus')};outline-offset:var(--component-focus-offset,2px)}
button,[part~=control]{transition:background-color ${v('--motion-duration-fast')} ease-out,border-color ${v('--motion-duration-fast')} ease-out}
[part~=row]{display:flex;align-items:center;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=label]{font-weight:500}
[part~=description],[part~=hint]{font-size:var(--component-caption-font-size,11px);color:${v('--color-muted-foreground')};margin:0}
[part~=error]{color:${v('--color-danger')};margin:0}
[part~=icon]{inline-size:var(--component-icon-size,16px);block-size:var(--component-icon-size,16px);flex:none;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
[part~=sr-only]{position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
@media (forced-colors:active){button,[part~=control]{border-color:ButtonText}button:disabled{color:GrayText}[aria-selected=true],[aria-checked=true],[aria-pressed=true]{outline:2px solid Highlight;outline-offset:-2px}}
`
