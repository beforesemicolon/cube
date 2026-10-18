import { UIComponent } from '../core/UIComponent.js'
import { bool, finite, scalarText } from '../core/value.js'
import type { StudioItem, StudioKind, StudioProps, StudioValue } from './types.js'

/**
 * Shared, renderer-independent behavior for Studio controls.
 * Concrete component bases identify their semantic kind; concrete renderers only build the DOM.
 */
export abstract class StudioComponentBase<P extends StudioProps = StudioProps> extends UIComponent<P> {
    static observedAttributes = [
        ...UIComponent.observedAttributes,
        'value', 'items', 'placeholder', 'status', 'action-label', 'empty-label', 'min', 'max', 'step', 'progress',
        'checked', 'open', 'multiple', 'required', 'read-only', 'invalid', 'error', 'expanded', 'orientation',
    ]

    value: StudioValue = ''
    items: readonly StudioItem[] = []
    placeholder = ''
    status = ''
    actionLabel = ''
    emptyLabel = ''
    min = 0
    max = 100
    step = 1
    progress = 0
    checked = false
    open = false
    multiple = false
    required = false
    readOnly = false
    invalid = false
    error = ''
    expanded = false
    orientation: 'horizontal' | 'vertical' = 'horizontal'

    abstract readonly componentName: string
    abstract readonly componentKind: StudioKind

    studioLabel(): string { return scalarText(this.label) || this.ui('field') }
    studioAccessibleName(): string { return this.accessibleName('field') }
    studioDescription(): string { return scalarText(this.description) }
    studioPlaceholder(): string { return scalarText(this.placeholder) }
    studioStatus(): string { return scalarText(this.status) }
    studioEmptyLabel(): string { return scalarText(this.emptyLabel) || this.ui('noContent') }
    studioActionLabel(): string { return scalarText(this.actionLabel) || this.ui('action') }
    studioItems(): readonly StudioItem[] { return Array.isArray(this.items) ? this.items : [] }
    studioDisabled(): boolean { return this.unavailable }
    studioReadOnly(): boolean { return bool(this.readOnly) }
    studioChecked(): boolean { return bool(this.checked) }
    studioOpen(): boolean { return bool(this.open) }
    studioExpanded(): boolean { return bool(this.expanded) }
    studioRequired(): boolean { return bool(this.required) }
    studioInvalid(): boolean { return bool(this.invalid) }
    studioError(): string { return scalarText(this.error) }
    studioMultiple(): boolean { return bool(this.multiple) }
    studioNumber(name: 'min' | 'max' | 'step' | 'progress'): number {
        const fallback = name === 'max' ? 100 : name === 'step' ? 1 : 0
        return finite(this[name], fallback)
    }
    studioTextValue(): string {
        if (Array.isArray(this.value)) return this.value.join(', ')
        return typeof this.value === 'string' || typeof this.value === 'number' ? String(this.value) : ''
    }

    setValue(value: StudioValue, originalEvent?: Event): boolean {
        if (this.studioDisabled() || this.studioReadOnly()) return false
        const detail = { value, originalEvent }
        if (!this.request('cb-before-change', detail)) return false
        this.value = value
        this.checked = typeof value === 'boolean' ? value : this.checked
        this.syncView()
        this.emit('cb-change', detail)
        return true
    }

    activate(item?: StudioItem, originalEvent?: Event): boolean {
        if (this.studioDisabled() || item?.disabled) return false
        const detail = { item: item ?? null, value: item?.value ?? item?.id ?? this.value, originalEvent }
        if (!this.request('cb-before-action', detail)) return false
        if (item) this.value = item.value ?? item.id
        this.syncView()
        this.emit('cb-action', detail)
        return true
    }

    toggle(next = !this.studioOpen(), originalEvent?: Event): boolean {
        if (this.studioDisabled()) return false
        const detail = { open: next, originalEvent }
        if (!this.request(next ? 'cb-before-open' : 'cb-before-close', detail)) return false
        this.open = next
        this.toggleAttribute('open', next)
        this.syncView()
        this.emit(next ? 'cb-open' : 'cb-close', detail)
        return true
    }
}
