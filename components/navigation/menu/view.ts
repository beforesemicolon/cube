import { element, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { safeHref } from '../../core/url.js'
import type { MenuBase } from './MenuBase.js';
import { RovingFocus } from '../../core/roving.js';
import { createIcon, iconPaths } from '../../icons/paths.js';
import { bool } from '../../core/value.js';
import { createBareButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import type { Link } from '../link/index.js';
type MenuControl = Button | Link;
export interface MenuView {
    root: Template;
    menu: HTMLElement;
    update(): void;
    focusFirst(): void;
}
export const menuCSS = editorCSS + `
:host{display:block;min-inline-size:180px}[part=menu]{display:flex;flex-direction:column;gap:1px;padding:var(--spacing-xs,4px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-sm,6px);background:var(--color-surface-raised,#fff);box-shadow:0 12px 32px rgba(12,18,24,.16);overflow:auto}
[part=item]{display:block;inline-size:100%;min-block-size:28px;padding:0;border:0;background:transparent;text-align:start;white-space:nowrap}
[part=item]::part(control){display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;gap:var(--spacing-sm,8px);inline-size:100%;padding:4px 8px;text-align:inherit;white-space:inherit}[part=item]::part(button-label){display:contents}
cb-link[part=item]::part(label){display:contents}
[part=item]:hover:not(:disabled),[part=item]:focus-visible{background:var(--color-active,#e8ecee)}[part=item][data-checked]{color:var(--color-signal-text,#1d50b3);background:var(--color-selection,#eaf1ff)}
[part=separator]{block-size:1px;margin:var(--spacing-xs,4px);background:var(--color-separator,#dae0e4)}[part=description]{grid-column:2/-1}[part=shortcut]{color:var(--color-muted-foreground,#606b73);font:500 10px/1 var(--typography-mono-font-family,ui-monospace,monospace)}[part=icon]{inline-size:14px;block-size:14px}
`;
export function createMenuView(host: MenuBase, onActivate: (item: MenuBase['normalizedItems'][number], event: Event) => void): MenuView {
    const menu = element('div', { attributes: { part: 'menu' } }) as HTMLDivElement;
    menu.setAttribute('role', 'menu');
    const roving = new RovingFocus(() => Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-role]:not([data-disabled])')), () => 'vertical');
    menu.addEventListener('keydown', event => {
        roving.keydown(event);
        if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && event.target.matches('[data-menu-role]')) {
            event.preventDefault();
            event.target.click();
        }
    });
    const update = (): void => {
        menu.setAttribute('aria-label', host.resolvedMenuLabel());
        menu.replaceChildren(...host.normalizedItems.map(item => {
            if (item.separator)
                return element('div', { attributes: { part: 'separator' } }) as HTMLDivElement;
            const href = safeHref(item.href);
            let control: MenuControl;
            if (href) {
                const link = document.createElement('cb-link') as Link;
                link.setAttribute('part', 'item');
                link.setAttribute('exportparts', 'control:item-control,label:item-label');
                link.toggleAttribute('data-bare', true);
                link.href = href;
                link.addEventListener('navigate', event => { event.stopPropagation(); onActivate(item, (event as CustomEvent<{
                    originalEvent: Event;
                }>).detail.originalEvent); });
                control = link;
            }
            else
                control = createBareButton('item', event => onActivate(item, event));
            const role = item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem';
            control.dataset.menuRole = role;
            control.dataset.label = item.label;
            control.accessibleLabel = item.label;
            control.disabled = bool(host.disabled) || item.disabled;
            if (href)
                control.setControlAttribute('role', role);
            else
                control.setAttribute('role', role);
            if (role !== 'menuitem') {
                if (href)
                    control.setControlAttribute('aria-checked', String(Boolean(item.checked)));
                else
                    control.setAttribute('aria-checked', String(Boolean(item.checked)));
                control.toggleAttribute('data-checked', Boolean(item.checked));
            }
            if (item.children?.length) {
                if (href)
                    control.setControlAttribute('aria-haspopup', 'menu');
                else
                    control.setAttribute('aria-haspopup', 'menu');
            }
            control.append(item.icon && Object.hasOwn(iconPaths, item.icon) ? createIcon(item.icon) : element('span', { attributes: { part: 'icon-spacer' } }) as HTMLSpanElement);
            const copy = element('span', { attributes: { part: 'item-copy' } }) as HTMLSpanElement;
            copy.append(element('span', { attributes: { part: 'item-label' }, textContent: item.label }) as HTMLSpanElement);
            if (item.description)
                copy.append(element('span', { attributes: { part: 'description' }, textContent: item.description }) as HTMLSpanElement);
            control.append(copy);
            if (item.shortcut)
                control.append(element('span', { attributes: { part: 'shortcut' }, textContent: item.shortcut }) as HTMLSpanElement);
            else if (item.children?.length)
                control.append(createIcon('right'));
            return control;
        }));
        roving.reset(0);
    };
    return { root: html`<style part="styles">${menuCSS}</style>${menu}`, menu, update, focusFirst: () => menu.querySelector<HTMLElement>('[data-menu-role]:not([data-disabled])')?.focus() };
}
