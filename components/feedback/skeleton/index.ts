import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { bool } from '../../core/value.js';
import { SkeletonBase } from './SkeletonBase.js';
export class Skeleton extends SkeletonBase {
    private container?: HTMLElement;
    render(): Template {
        this.container = element('div', { attributes: { part: 'root skeleton' } }) as HTMLDivElement;
        return html`<style part="styles">${editorCSS + `
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
`}</style>${this.container}`;
    }
    protected syncView(): void {
        if (!this.container)
            return;
        const variant = this.normalizedVariant();
        this.dataset.variant = variant;
        this.toggleAttribute('data-animated', bool(this.animated));
        this.container.replaceChildren();
        if (variant === 'card')
            this.renderCard();
        else if (variant === 'table')
            this.renderTable();
        else
            this.renderLines(this.container, this.count(this.lines, 3));
        const label = this.loadingLabel();
        aria(this.container, 'role', label ? 'status' : null);
        aria(this.container, 'aria-label', label);
        aria(this.container, 'aria-live', label ? 'polite' : null);
        aria(this.container, 'aria-hidden', label ? null : true);
    }
    private renderLines(target: HTMLElement, count: number): void {
        for (let index = 0; index < count; index += 1)
            target.append(element('span', { attributes: { part: 'shape line' } }) as HTMLSpanElement);
    }
    private renderCard(): void {
        if (!this.container)
            return;
        const card = element('div', { attributes: { part: 'card' } }) as HTMLDivElement;
        card.append(element('span', { attributes: { part: 'shape media' } }) as HTMLSpanElement);
        const content = element('div', { attributes: { part: 'card-content' } }) as HTMLDivElement;
        this.renderLines(content, this.count(this.lines, 3));
        card.append(content);
        this.container.append(card);
    }
    private renderTable(): void {
        if (!this.container)
            return;
        const table = element('div', { attributes: { part: 'table' } }) as HTMLDivElement;
        const columns = this.count(this.columns, 3);
        table.style.setProperty('--component-skeleton-columns', String(columns));
        for (let rowIndex = 0; rowIndex < this.count(this.rows, 3); rowIndex += 1) {
            const row = element('div', { attributes: { part: 'row' } }) as HTMLDivElement;
            for (let columnIndex = 0; columnIndex < columns; columnIndex += 1)
                row.append(element('span', { attributes: { part: 'shape cell' } }) as HTMLSpanElement);
            table.append(row);
        }
        this.container.append(table);
    }
}
export { SkeletonBase };
export type { SkeletonProps, SkeletonVariant } from './SkeletonBase.js';
