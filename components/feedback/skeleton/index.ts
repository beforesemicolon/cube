import componentStylesheet from './styles.css?inline'
import { is, html, repeat, when, type Template } from '../../core/runtime.js'

import { bool } from '../../core/value.js'
import { SkeletonBase } from './SkeletonBase.js'

export class Skeleton extends SkeletonBase {
    stylesheet = componentStylesheet

    render(): Template {
        const lines = () => repeat(() => this.count(this.lines, 3), () => html`<span part="shape line"></span>`)
        return html`
            <div part="root skeleton" data-variant=${this.normalizedVariant} role="${() => this.loadingLabel() ? 'status' : null}"
                aria-label="${() => this.loadingLabel() || null}" aria-live="${() => this.loadingLabel() ? 'polite' : null}"
                aria-hidden="${() => this.loadingLabel() ? null : 'true'}">
                ${when(is(this.normalizedVariant, 'card'),
                    html`<div part="card"><span part="shape media"></span><div part="card-content">${lines()}</div></div>`,
                    when(is(this.normalizedVariant, 'table'),
                        html`<div part="table" style="${() => '--component-skeleton-columns:' + (this.count(this.columns,3) === 3 ? '90fr 80fr 62fr' : `repeat(${this.count(this.columns,3)},minmax(0,1fr))`)}">
                            ${repeat(() => this.count(this.rows, 3), () => html`<div part="row">${repeat(() => this.count(this.columns, 3), () => html`<span part="shape cell"></span>`)}</div>`)}
                        </div>`, lines()))}
            </div>`
    }
    protected syncView(): void {
        this.dataset.variant = this.normalizedVariant()
        this.toggleAttribute('data-animated', bool(this.animated))
    }
}
export { SkeletonBase };
export type { SkeletonProps, SkeletonVariant } from './SkeletonBase.js';
