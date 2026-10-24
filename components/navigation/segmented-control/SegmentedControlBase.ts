import { ChoiceGroupBase, type ChoiceGroupProps } from '../ChoiceGroupBase.js'
import type { NormalizedItem } from '../../core/items.js'
import { bool, scalarText } from '../../core/value.js'

export interface SegmentedControlProps extends ChoiceGroupProps { iconOnly?: boolean; allowEmpty?: boolean; multiple?: boolean; values?: string[] }

/** Headless single- or multiple-selection model for compact related values. */
export abstract class SegmentedControlBase<P extends SegmentedControlProps = SegmentedControlProps> extends ChoiceGroupBase<P> {
    static observedAttributes = [...ChoiceGroupBase.observedAttributes, 'icon-only', 'allow-empty', 'multiple', 'values']
    iconOnly = false
    /** Allow activating the current choice again to clear it. Opt-in. */
    allowEmpty = false
    /** Multiple mode uses values; change includes the activated value and values. */
    multiple = false
    values: string[] = []
    protected selectedValues(): string[] {
        const values: readonly string[] = this.props.values?.() || []
        if (!Array.isArray(values)) return []
        return this.choices.filter(item => values.includes(item.id)).map(item => item.id)
    }

    protected choose(item: NormalizedItem, originalEvent: Event): void {
        if (bool(this.multiple)) {
            originalEvent.stopPropagation()
            if (this.unavailable || item.disabled) return
            const previousValues = this.selectedValues(), selected = previousValues.includes(item.id)
            const values = selected ? previousValues.filter(value => value !== item.id) : [...previousValues, item.id]
            if (!values.length && !bool(this.allowEmpty)) return
            const detail = { value: item.id, values, previousValues, item, originalEvent }
            // Consumers may normalize the proposed values during beforechange.
            if (!this.request('beforechange', detail)) return
            this.values = values
            this.syncView()
            this.emit('change', detail)
            return
        }
        if (!bool(this.allowEmpty) || item.id !== scalarText(this.value)) { super.choose(item, originalEvent); return }
        originalEvent.stopPropagation()
        if (this.unavailable || item.disabled) return
        const detail = { value: '', previousValue: this.value, item, originalEvent }
        if (!this.request('beforechange', detail)) return
        this.value = ''
        this.syncView()
        this.emit('change', detail)
    }
}
