import { html, repeat, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { safeHref } from '../../core/url.js'
import { BreadcrumbBase } from './BreadcrumbBase.js'
const css = editorCSS + `:host{display:block;min-inline-size:0}[part=list]{display:flex;align-items:center;gap:var(--spacing-xs,4px);padding:0;margin:0;list-style:none;min-inline-size:0;overflow:hidden}[part=item]{display:flex;align-items:center;gap:var(--spacing-xs,4px);min-inline-size:0}[part=link],[part=current],[part=expand]{min-block-size:24px;padding:2px 4px;border:0;background:transparent;color:var(--color-muted-foreground,#606b73);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}[part=link]::part(control){color:inherit;text-decoration:none}[part=current]{color:var(--color-foreground,#20262b);font-weight:600}[part=separator]{inline-size:12px;block-size:12px;color:var(--color-muted-foreground,#606b73)}`;
export class Breadcrumb extends BreadcrumbBase {
    render(): Template {
        return html`<style part="styles">${css}</style><nav part="navigation" aria-label="${this.accessibleName}"><ol part="list">
            ${repeat(this.visibleCrumbs, (item, index) => html`<li part="item">
                ${index > 0 ? html`<cb-icon part="separator" name="right" decorative="true"></cb-icon>` : ''}
                ${item === 'ellipsis' ? html`<cb-button part="expand" exportparts="control:expand-control,label:expand-label,button-label:expand-label,icon:expand-icon,description:expand-description" icon="more" icon-only="true" variant="ghost"
                    accessible-label="${this.props.expandLabel}" onaction="${() => { this.expanded = true }}"></cb-button>`
                    : index === this.visibleCrumbs().length - 1 && item.id === this.crumbs.at(-1)?.id
                        ? html`<span part="current" aria-current="page">${item.label}</span>`
                        : safeHref(item.href) ? html`<cb-link part="link" exportparts="control:link-control,label:link-label" data-bare
                            href="${safeHref(item.href)}" label="${item.label}" accessible-label="${item.label}" disabled="${item.disabled}"
                            onnavigate="${(event: CustomEvent<{ originalEvent: Event }>) => { event.stopPropagation(); this.navigate(item, event.detail.originalEvent) }}"></cb-link>`
                        : html`<cb-button part="link" exportparts="control:link-control,label:link-label,button-label:link-label,icon:link-icon,description:link-description" data-bare data-semantic-host label="${item.label}" accessible-label="${item.label}" disabled="${item.disabled}"
                            onaction="${(event: Event) => this.navigate(item, event)}"></cb-button>`}
            </li>`, { key: item => item === 'ellipsis' ? 'ellipsis' : item.id })}
        </ol></nav>`
    }
}
export { BreadcrumbBase };
export type { BreadcrumbProps } from './BreadcrumbBase.js';
