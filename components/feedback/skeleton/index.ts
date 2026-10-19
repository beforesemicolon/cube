import { is, css as componentStyles, html, repeat, when, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool } from '../../core/value.js'
import { SkeletonBase } from './SkeletonBase.js'
const css = editorCSS + `
:host{display:block;inline-size:var(--component-skeleton-width,100%);max-inline-size:100%}
[part~=root]{display:grid;gap:var(--component-skeleton-gap,var(--spacing-sm,8px));inline-size:100%;min-inline-size:0}
[part~=shape]{position:relative;display:block;overflow:hidden;border-radius:var(--component-skeleton-radius,var(--radius-sm,6px));background:var(--component-skeleton-color,var(--color-track));color:transparent}
:host([data-animated]) [part~=shape]::after{content:'';position:absolute;inset:0;translate:-100% 0;background:linear-gradient(90deg,transparent,var(--component-skeleton-highlight,color-mix(in srgb,var(--color-surface) 55%,transparent)),transparent);animation:cb-skeleton-shimmer var(--component-skeleton-duration,1.4s) ease-in-out infinite}
[part~=line]{block-size:var(--component-skeleton-line-height,10px)}[part~=line]:nth-child(3n+2){inline-size:88%}[part~=line]:nth-child(3n){inline-size:68%}
[part~=media]{aspect-ratio:var(--component-skeleton-media-ratio,16/9);inline-size:100%}
[part~=card]{padding:var(--spacing-sm,8px);border:1px solid var(--color-separator);border-radius:var(--radius-md);background:var(--color-surface)}[part~=card-content]{display:grid;gap:var(--spacing-sm,8px);padding-block-start:var(--spacing-sm,8px)}
[part~=table]{gap:var(--component-skeleton-table-gap,1px);overflow:hidden;border:1px solid var(--color-separator);border-radius:var(--radius-sm);background:var(--color-separator)}
[part~=row]{display:grid;grid-template-columns:repeat(var(--component-skeleton-columns,3),minmax(0,1fr));gap:1px;background:var(--color-separator)}[part~=cell]{min-block-size:var(--component-skeleton-cell-height,32px);border-radius:0;background:var(--color-surface-muted)}
@keyframes cb-skeleton-shimmer{to{translate:100% 0}}
@media(prefers-reduced-motion:reduce){:host([data-animated]) [part~=shape]::after{animation:none;display:none}}
`;
export class Skeleton extends SkeletonBase {
    stylesheet = componentStyles`${css}`

    render(): Template {
        const lines = () => repeat(() => this.count(this.lines, 3), () => html`<span part="shape line"></span>`)
        return html`
            <div part="root skeleton" role="${() => this.loadingLabel() ? 'status' : null}"
                aria-label="${() => this.loadingLabel() || null}" aria-live="${() => this.loadingLabel() ? 'polite' : null}"
                aria-hidden="${() => this.loadingLabel() ? null : 'true'}">
                ${when(is(this.normalizedVariant, 'card'),
                    html`<div part="card"><span part="shape media"></span><div part="card-content">${lines()}</div></div>`,
                    when(is(this.normalizedVariant, 'table'),
                        html`<div part="table" style="${() => '--component-skeleton-columns:' + this.count(this.columns, 3)}">
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
