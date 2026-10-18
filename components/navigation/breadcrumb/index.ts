import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, safeHref, sheet } from '../../core/editor-dom.js'
import { createIcon } from '../../icons/paths.js'
import { BreadcrumbBase } from './BreadcrumbBase.js'

export class Breadcrumb extends BreadcrumbBase {
    private nav?: HTMLElement
    private list?: HTMLOListElement
    render(): Node {
        this.nav = el('nav', 'navigation'); this.list = el('ol', 'list'); this.nav.append(this.list)
        return fragment(sheet(editorCSS + `:host{display:block;min-inline-size:0}[part=list]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding:0;margin:0;list-style:none;min-inline-size:0;overflow:hidden}[part=item]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part=link],[part=current],[part=expand]{min-block-size:24px;padding:2px 4px;border:0;background:transparent;color:var(--color-muted-foreground,#606b73);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part=current]{color:var(--color-foreground,#20262b);font-weight:600}[part=separator]{inline-size:12px;block-size:12px;color:var(--color-muted-foreground,#606b73)}`), this.nav)
    }
    protected syncView(): void {
        if (!this.nav || !this.list) return
        this.nav.setAttribute('aria-label', this.accessibleName())
        const crumbs = this.visibleCrumbs()
        this.list.replaceChildren(...crumbs.map((item, index) => {
            const li = el('li', 'item')
            if (index > 0) li.append(createIcon('right', 'separator'))
            if (item === 'ellipsis') {
                const expand = el('button', 'expand', '…'); expand.type = 'button'; expand.setAttribute('aria-label', this.expandLabel); expand.addEventListener('click', () => { this.expanded = true; this.syncView() }); li.append(expand); return li
            }
            const last = index === crumbs.length - 1 && item === this.crumbs.at(-1)
            if (last) { const current = el('span', 'current', item.label); current.setAttribute('aria-current', 'page'); li.append(current); return li }
            const href = safeHref(item.href), link = el(href ? 'a' : 'button', 'link', item.label)
            if (link instanceof HTMLAnchorElement) link.href = href; else link.type = 'button'
            if (item.disabled) link.setAttribute('aria-disabled', 'true')
            link.addEventListener('click', event => this.navigate(item, event)); li.append(link); return li
        }))
    }
}

register('cb-breadcrumb', Breadcrumb)
export { BreadcrumbBase }
export type { BreadcrumbProps } from './BreadcrumbBase.js'
