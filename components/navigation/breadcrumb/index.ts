import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { safeHref } from '../../core/url.js'
import { createIcon } from '../../icons/paths.js';
import { actionLabel, createBareButton, createIconButton } from '../../action/create.js';
import { BreadcrumbBase } from './BreadcrumbBase.js';
import type { Link } from '../link/index.js';
export class Breadcrumb extends BreadcrumbBase {
    private nav?: HTMLElement;
    private list?: HTMLOListElement;
    render(): Template {
        this.nav = element('nav', { attributes: { part: 'navigation' } }) as HTMLElement;
        this.list = element('ol', { attributes: { part: 'list' } }) as HTMLOListElement;
        this.nav.append(this.list);
        return html`<style part="styles">${editorCSS + `:host{display:block;min-inline-size:0}[part=list]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding:0;margin:0;list-style:none;min-inline-size:0;overflow:hidden}[part=item]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part=link],[part=current],[part=expand]{min-block-size:24px;padding:2px 4px;border:0;background:transparent;color:var(--color-muted-foreground,#606b73);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part=link]::part(link-control){color:inherit;text-decoration:none}[part=current]{color:var(--color-foreground,#20262b);font-weight:600}[part=separator]{inline-size:12px;block-size:12px;color:var(--color-muted-foreground,#606b73)}`}</style>${this.nav}`;
    }
    protected syncView(): void {
        if (!this.nav || !this.list)
            return;
        this.nav.setAttribute('aria-label', this.accessibleName());
        const crumbs = this.visibleCrumbs();
        this.list.replaceChildren(...crumbs.map((item, index) => {
            const li = element('li', { attributes: { part: 'item' } }) as HTMLLIElement;
            if (index > 0)
                li.append(createIcon('right', 'separator'));
            if (item === 'ellipsis') {
                const expand = createIconButton('expand', 'more', () => { this.expanded = true; this.syncView(); });
                actionLabel(expand, this.expandLabel);
                li.append(expand);
                return li;
            }
            const last = index === crumbs.length - 1 && item === this.crumbs.at(-1);
            if (last) {
                const current = element('span', { attributes: { part: 'current' }, textContent: item.label }) as HTMLSpanElement;
                current.setAttribute('aria-current', 'page');
                li.append(current);
                return li;
            }
            const href = safeHref(item.href);
            if (!href) {
                const action = createBareButton('link', event => this.navigate(item, event));
                actionLabel(action, item.label);
                action.disabled = item.disabled;
                li.append(action);
                return li;
            }
            const link = document.createElement('cb-link') as Link;
            link.setAttribute('part', 'link');
            link.setAttribute('exportparts', 'control:link-control,label:link-label');
            link.toggleAttribute('data-bare', true);
            Object.assign(link, { href, label: item.label, accessibleLabel: item.label, disabled: item.disabled });
            link.addEventListener('navigate', event => {
                event.stopPropagation();
                this.navigate(item, (event as CustomEvent<{
                    originalEvent: Event;
                }>).detail.originalEvent);
            });
            li.append(link);
            return li;
        }));
    }
}
export { BreadcrumbBase };
export type { BreadcrumbProps } from './BreadcrumbBase.js';
