import { html, state, type Template } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { uid } from '../../core/id.js';
import { bool, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { ExpandableSectionBase } from './ExpandableSectionBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0}
[part~=root]{display:grid;grid-template-columns:minmax(0,1fr) auto;inline-size:100%;min-inline-size:0}
[part~=trigger]{grid-column:1;display:block;min-block-size:var(--component-expandable-section-header-height,40px);padding:0;border:0;border-radius:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:start}
[part~=trigger]::part(control){display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:var(--spacing-sm,8px);inline-size:100%;min-block-size:100%;padding:var(--component-expandable-section-header-padding,var(--spacing-sm,8px) 0);text-align:inherit}
[part~=trigger]::part(button-label){display:contents}
button[part~=trigger]:hover:not(:disabled),button[part~=trigger]:active:not(:disabled){background:transparent}
[part~=trigger]:hover [part~=label],[part~=trigger]:hover [part~=icon],[part~=trigger]:active [part~=label],[part~=trigger]:active [part~=icon]{color:var(--component-expandable-section-hover-color,${v('--color-primary-hover')})}
[part~=trigger]:focus-within{outline:var(--focus-ring);outline-offset:2px}
[part~=icon]{margin-block-start:1px;color:var(--component-expandable-section-icon-color,currentColor);transition:color var(--motion-duration-fast,100ms) ease-out}
[part~=heading]{display:block;min-inline-size:0}
[part~=label-row]{display:flex;align-items:baseline;gap:var(--spacing-sm,8px);min-inline-size:0}
[part~=label]{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color var(--motion-duration-fast,100ms) ease-out}
[part~=counter]{color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);font-variant-numeric:tabular-nums}
[part~=description]{display:block;margin-block-start:var(--spacing-xs,4px);color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px)}
[part~=header-extras]{grid-column:2;display:flex;align-items:center;gap:var(--spacing-xs,4px);padding-block:var(--spacing-xs,4px);padding-inline-start:var(--spacing-sm,8px)}
[part~=header-extras][hidden]{display:none}
[part~=panel]{grid-column:1/-1;min-inline-size:0}
[part~=content]{display:block;padding:var(--component-expandable-section-content-padding,var(--spacing-md,12px) 0)}
:host([data-disable-content-padding]) [part~=content]{padding:0}
:host([data-variant=default]) [part~=root]{border-block-end:1px solid var(--component-expandable-section-border,${v('--color-separator')})}
:host([data-variant=default][data-expanded]) [part~=root]{border-block-end:0}
:host([data-variant=default][data-expanded]) [part~=panel]{border-block-start:1px solid var(--component-expandable-section-border,${v('--color-separator')})}
:host([data-variant=container]) [part~=root]{border:1px solid ${v('--color-separator')};border-radius:var(--radius-md,10px);background:${v('--color-surface')};overflow:hidden}
:host([data-variant=container]) [part~=trigger]::part(control){padding:var(--spacing-md,12px)}
:host([data-variant=container]) [part~=header-extras]{padding:var(--spacing-sm,8px) var(--spacing-md,12px) var(--spacing-sm,8px) 0}
:host([data-variant=container][data-expanded]) [part~=panel]{border-block-start:1px solid var(--component-expandable-section-border,${v('--color-separator')})}
:host([data-variant=container]) [part~=content]{padding:var(--spacing-md,12px)}
:host([data-variant=container][data-disable-content-padding]) [part~=content]{padding:0}
:host([data-variant=footer]) [part~=root]{border-block-start:1px solid ${v('--color-separator')}}
:host([data-disabled]) [part~=trigger]{cursor:not-allowed;color:${v('--color-muted-foreground')};opacity:var(--component-disabled-opacity,.5)}
@container(max-width:480px){[part~=root]{grid-template-columns:minmax(0,1fr)}[part~=header-extras]{grid-column:1;padding:0 0 var(--spacing-sm,8px) calc(var(--component-icon-size,16px) + var(--spacing-sm,8px))}}
`;
export class ExpandableSection extends ExpandableSectionBase {
    private readonly triggerId = uid('cb-expandable-trigger');
    private readonly panelId = uid('cb-expandable-panel');
    private readonly extrasVisible = state(false);
    render(): Template {
        return html`<style part="styles">${css}</style>
            <section part="root" data-expanded=${() => bool(this.expanded) ? '' : null} data-variant=${this.resolvedVariant}>
                <cb-button part="header trigger" data-bare data-semantic-host variant="ghost" id=${this.triggerId}
                    exportparts="control:trigger-control,button-label:trigger-label"
                    disabled=${() => bool(this.disabled)} aria-disabled=${() => bool(this.disabled) || null}
                    accessible-label=${() => [this.label,this.counter,this.description,this.accessibleLabel].map(value => scalarText(value)).filter(Boolean).join(' ')}
                    aria-controls=${this.panelId} aria-expanded=${() => bool(this.expanded)}
                    onaction=${(event: Event) => { event.stopPropagation(); event.preventDefault(); this.toggle(event); }}>
                    <cb-icon part="icon" name=${() => bool(this.expanded) ? 'down' : 'right'} decorative></cb-icon>
                    <span part="heading" role="heading" aria-level=${this.resolvedHeadingLevel}
                        aria-label=${() => scalarText(this.label) || scalarText(this.accessibleLabel) || null}>
                        <span part="label-row"><span part="label">${this.props.label}</span>
                            <span part="counter" hidden=${() => !scalarText(this.counter)}>${this.props.counter}</span></span>
                        <span part="description" hidden=${() => !scalarText(this.description)}>${this.props.description}</span>
                    </span>
                    <span part="accessible-action sr-only">${() => this.label && this.accessibleLabel !== this.label ? this.accessibleLabel : ''}</span>
                </cb-button>
                <div part="header-extras" hidden=${() => !this.extrasVisible[0]()}>
                    <slot name="header-info" part="header-info" ref="extras" onslotchange=${this.syncExtras}></slot>
                    <slot name="header-actions" part="header-actions" ref="extras" onslotchange=${this.syncExtras}></slot>
                </div>
                <div part="panel" id=${this.panelId} role="region" aria-labelledby=${this.triggerId}
                    hidden=${() => !bool(this.expanded)} inert=${() => !bool(this.expanded) ? '' : null}>
                    <slot part="content"></slot>
                </div>
            </section>`;
    }
    private syncExtras = (): void => {
        this.extrasVisible[1]((this.refs.extras ?? []).some(slot => slot instanceof HTMLSlotElement && slot.assignedElements().length > 0));
    }
    protected syncView(): void {
        this.dataset.variant = this.resolvedVariant();
        this.toggleAttribute('data-expanded', bool(this.expanded));
        this.toggleAttribute('data-disable-content-padding', bool(this.disableContentPadding));
    }
}
export { ExpandableSectionBase };
export type { ExpandableSectionChangeDetail, ExpandableSectionProps, ExpandableSectionVariant } from './ExpandableSectionBase.js';
