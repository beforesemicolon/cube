import { ChoiceGroupBase, type ChoiceGroupProps } from '../ChoiceGroupBase.js'
import type { ActionItem, NormalizedItem } from '../../core/items.js'
import { bool, scalarText } from '../../core/value.js'

export type IconOnlyBreakpoint = '' | 'sm' | 'md' | 'lg'
export interface SegmentedItem extends ActionItem { closable?: boolean }
export interface SegmentedControlProps extends Omit<ChoiceGroupProps, 'items'> {
    items?: SegmentedItem[]
    closeLabel?: string
    iconOnly?: boolean
    iconOnlyAt?: IconOnlyBreakpoint
    allowEmpty?: boolean
    multiple?: boolean
    values?: string[]
}

/** Headless single- or multiple-selection model for compact related values. */
export abstract class SegmentedControlBase<
    P extends SegmentedControlProps = SegmentedControlProps,
> extends ChoiceGroupBase<P> {
    static observedAttributes = [
        ...ChoiceGroupBase.observedAttributes,
        'icon-only',
        'icon-only-at',
        'allow-empty',
        'multiple',
        'values',
        'close-label',
    ]
    declare items: SegmentedItem[]
    closeLabel = ''
    iconOnly = false
    iconOnlyAt: IconOnlyBreakpoint = ''
    protected get normalizedIconOnlyBreakpoint(): IconOnlyBreakpoint {
        return ['sm', 'md', 'lg'].includes(this.iconOnlyAt)
            ? this.iconOnlyAt
            : ''
    }
    /** Allow activating the current choice again to clear it. Opt-in. */
    allowEmpty = false
    /** Multiple mode uses values; change includes the activated value and values. */
    multiple = false
    values: string[] = []
    protected selectedValues(): string[] {
        const values: readonly string[] = this.props.values?.() || []
        if (!Array.isArray(values)) return []
        return this.choices
            .filter((item) => values.includes(item.id))
            .map((item) => item.id)
    }

    protected closeSegment(item: NormalizedItem, originalEvent: Event): boolean {
        originalEvent.stopPropagation()
        const source = this.items.find(candidate => scalarText(candidate.id) === item.id)
        if (this.unavailable || item.disabled || !source?.closable) return false
        const choices = this.choices, index = choices.findIndex(choice => choice.id === item.id)
        const items = this.items.filter(candidate => scalarText(candidate.id) !== item.id)
        const remaining = choices.filter(choice => choice.id !== item.id && !choice.disabled)
        const next = choices.slice(index + 1).find(choice => !choice.disabled) || [...choices.slice(0, index)].reverse().find(choice => !choice.disabled)
        const value = scalarText(this.value) === item.id ? next?.id || '' : scalarText(this.value)
        const values = this.selectedValues().filter(id => id !== item.id)
        if (bool(this.multiple) && !bool(this.allowEmpty) && !values.length && remaining[0]) values.push(remaining[0].id)
        const detail = { id: item.id, item: source, items, value, values, originalEvent }
        if (!this.request('beforeclose', detail)) return false
        this.items = items
        this.value = value
        if (bool(this.multiple)) this.values = values
        this.syncView()
        this.emit('close', detail)
        return true
    }

    protected choose(item: NormalizedItem, originalEvent: Event): void {
        if (bool(this.multiple)) {
            originalEvent.stopPropagation()
            if (this.unavailable || item.disabled) return
            const previousValues = this.selectedValues(),
                selected = previousValues.includes(item.id)
            const values = selected
                ? previousValues.filter((value) => value !== item.id)
                : [...previousValues, item.id]
            if (!values.length && !bool(this.allowEmpty)) return
            const detail = {
                value: item.id,
                values,
                previousValues,
                item,
                originalEvent,
            }
            // Consumers may normalize the proposed values during beforechange.
            if (!this.request('beforechange', detail)) return
            this.values = values
            this.syncView()
            this.emit('change', detail)
            return
        }
        if (!bool(this.allowEmpty) || item.id !== scalarText(this.value)) {
            super.choose(item, originalEvent)
            return
        }
        originalEvent.stopPropagation()
        if (this.unavailable || item.disabled) return
        const detail = {
            value: '',
            previousValue: this.value,
            item,
            originalEvent,
        }
        if (!this.request('beforechange', detail)) return
        this.value = ''
        this.syncView()
        this.emit('change', detail)
    }
}
