import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { when, isNot, html, state, type Template } from '../../core/runtime.js'

import { uid } from '../../core/id.js';
import { bool, scalarText } from '../../core/value.js';

import { ExpandableSectionBase } from './ExpandableSectionBase.js';

export class ExpandableSection extends ExpandableSectionBase {
    stylesheet = componentStylesheet

    private readonly triggerId = uid('cb-expandable-trigger');
    private readonly panelId = uid('cb-expandable-panel');
    private readonly extrasVisible = state(false);
    render(): Template {
        return html`
            <section part="root" data-expanded=${() => bool(this.expanded) ? '' : null} data-variant=${this.resolvedVariant}>
                <cb-button part="header trigger" data-bare data-semantic-host variant="ghost" id=${this.triggerId}
                    exportparts="control:trigger-control,button-label:trigger-label"
                    disabled=${this.props.disabled} aria-disabled=${() => bool(this.disabled) || null}
                    accessible-label=${() => [this.label,this.counter,this.description,this.accessibleLabel].map(value => scalarText(value)).filter(Boolean).join(' ')}
                    aria-controls=${this.panelId} aria-expanded=${when(this.props.expanded, 'true', 'false')}
                    onaction=${(event: Event) => { event.stopPropagation(); event.preventDefault(); this.toggle(event); }}>
                    <cb-icon part="icon" name=${() => bool(this.expanded) ? 'down' : 'right'} decorative></cb-icon>
                    <span part="heading" role="heading" aria-level=${this.resolvedHeadingLevel}
                        aria-label=${() => scalarText(this.label) || scalarText(this.accessibleLabel) || null}>
                        <span part="label-row"><span part="label">${this.props.label}</span>
                            <span part="counter" hidden=${isNot(this.props.counter)}>${this.props.counter}</span></span>
                        <span part="description" hidden=${isNot(this.props.description)}>${this.props.description}</span>
                    </span>
                    <span part="accessible-action sr-only">${() => this.label && this.accessibleLabel !== this.label ? this.accessibleLabel : ''}</span>
                </cb-button>
                <div part="header-extras" hidden=${isNot(this.extrasVisible[0])} onslotchange=${this.syncExtras}>
                    <slot name="header-info" part="header-info" ref="extras"></slot>
                    <slot name="header-actions" part="header-actions" ref="extras"></slot>
                </div>
                <div part="panel" id=${this.panelId} role="region" aria-labelledby=${this.triggerId}
                    hidden=${isNot(this.props.expanded)} inert=${() => !bool(this.expanded) ? '' : null}>
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

register('cb-expandable-section', ExpandableSection)
