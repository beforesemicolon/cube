import { token as v } from '../theme/tokens.js'
export function el<K extends keyof HTMLElementTagNameMap>(name: K, part: string, content?: string): HTMLElementTagNameMap[K] {
    const node = document.createElement(name)
    node.setAttribute('part', part)
    if (content !== undefined) node.textContent = content
    return node
}
export function sheet(css: string): HTMLStyleElement { const s = el('style', 'styles'); s.textContent = css; return s }
export function label(node: HTMLElement, value: string): void { node.setAttribute('aria-label', value); node.title = value }
export const commonCSS = `
:host{display:block;color:${v('--color-foreground')};font:${v('--typography-body-font-size')}/${v('--typography-body-line-height')} ${v('--typography-body-font-family')};container-type:inline-size}
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
button,select,input{font:inherit;color:inherit}
button,select{min-height:${v('--component-control-height')};border:1px solid ${v('--color-border')};border-radius:${v('--radius-sm')};background:${v('--color-surface-muted')};padding:${v('--spacing-xs')} ${v('--spacing-sm')}}
button{cursor:pointer;touch-action:manipulation}
button:hover{background:${v('--color-selection')}}
button:disabled{opacity:.5;cursor:not-allowed}
:focus-visible{outline:2px solid ${v('--color-focus')};outline-offset:2px}
input[type=range]{accent-color:${v('--color-primary')};min-height:${v('--component-control-height')};min-width:0}
[part~=status]{color:${v('--color-muted-foreground')};margin:0}
[part~=actions]{display:flex;gap:${v('--spacing-sm')};flex-wrap:wrap;align-items:center}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`
