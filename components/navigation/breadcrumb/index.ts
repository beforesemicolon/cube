import componentStylesheet from './styles.css?inline'
import { when, html, repeat, type Template } from '../../core/runtime.js'

import { safeHref } from '../../core/url.js'
import { BreadcrumbBase } from './BreadcrumbBase.js'

export class Breadcrumb extends BreadcrumbBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<nav part="navigation" aria-label="${this.accessibleName}"><ol part="list">
            ${repeat(this.visibleCrumbs, (item, index) => html`<li part="item">
                ${when(index > 0, () => html`<cb-icon part="separator" name="right" decorative="true"></cb-icon>`, () => '')}
                ${item === 'ellipsis' ? html`<cb-button part="expand" exportparts="control:expand-control,label:expand-label,button-label:expand-label,icon:expand-icon,description:expand-description" icon="more" icon-only="true" variant="ghost"
                    accessible-label="${this.props.expandLabel}" onbeforeaction="${(event: Event) => event.stopPropagation()}"
                    onaction="${(event: Event) => { event.stopPropagation(); this.expanded = true }}"></cb-button>` : when(() => index === this.visibleCrumbs().length - 1 && item.id === this.crumbs.at(-1)?.id, () => html`<span part="current" aria-current="page">${item.label}</span>`, () => when(() => safeHref(item.href), () => html`<cb-link part="link" exportparts="control:link-control,label:link-label" data-bare
                            href="${safeHref(item.href)}" label="${item.label}" accessible-label="${item.label}" disabled="${item.disabled}"
                            onbeforenavigate="${(event: Event) => event.stopPropagation()}"
                            onnavigate="${(event: CustomEvent<{ originalEvent: Event }>) => { event.stopPropagation(); this.navigate(item, event.detail.originalEvent) }}"></cb-link>`, () => html`<cb-button part="link" exportparts="control:link-control,label:link-label,button-label:link-label,icon:link-icon,description:link-description" data-bare data-semantic-host label="${item.label}" accessible-label="${item.label}" disabled="${item.disabled}"
                            onbeforeaction="${(event: Event) => event.stopPropagation()}"
                            onaction="${(event: Event) => { event.stopPropagation(); this.navigate(item, event) }}"></cb-button>`))}
            </li>`, { key: item => item === 'ellipsis' ? 'ellipsis' : item.id })}
        </ol></nav>`
    }
}
export { BreadcrumbBase };
export type { BreadcrumbProps } from './BreadcrumbBase.js';
