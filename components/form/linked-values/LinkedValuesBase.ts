import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export type LinkedValuesPair = readonly [number, number]
export type LinkedValuesInput = string | readonly number[]
export type LinkedValuesText = string | readonly string[]
export interface LinkedValuesProps extends FieldControlProps {
    values?: LinkedValuesInput
    names?: LinkedValuesText
    fieldLabels?: LinkedValuesText
    linked?: boolean
    min?: number
    max?: number
    step?: number
    linkLabel?: string
    unlinkLabel?: string
}

export interface LinkedValuesChangeDetail {
    readonly value: LinkedValuesPair
    readonly previousValue: LinkedValuesPair
    readonly index: 0 | 1
    readonly linked: boolean
    readonly originalEvent?: Event
}

/** One CSV record; quote entries containing commas and escape quotes by doubling them. */
function textEntries(value: LinkedValuesText): readonly string[] {
    // The external runtime parses scalar HTML attributes before assigning props.
    if (typeof value === 'number' || typeof value === 'boolean') return [scalarText(value)]
    if (typeof value !== 'string') return value
    const entries: string[] = []
    let entry = '', quoted = false
    for (let index = 0; index < value.length; index++) {
        const character = value[index]!
        if (character === '"') {
            if (quoted && value[index + 1] === '"') { entry += '"'; index++ }
            else quoted = !quoted
        } else if (character === ',' && !quoted) { entries.push(entry.trim()); entry = '' }
        else entry += character
    }
    entries.push(entry.trim())
    return entries
}

/** Coupled numeric-value behavior for dimensions, offsets and other paired properties. */
export abstract class LinkedValuesBase<P extends LinkedValuesProps = LinkedValuesProps> extends FieldControlBase<P, LinkedValuesPair, string> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes, 'values', 'names', 'field-labels',
        'linked', 'min', 'max', 'step', 'link-label', 'unlink-label',
    ]
    values: LinkedValuesInput = [0, 0]
    names: LinkedValuesText = []
    fieldLabels: LinkedValuesText = []
    linked = false
    min = Number.NEGATIVE_INFINITY
    max = Number.POSITIVE_INFINITY
    step = 1
    linkLabel = ''
    unlinkLabel = ''
    private ratio = 1
    private ratioValues: LinkedValuesPair = [0, 0]
    protected fieldElement(): undefined { return undefined }
    protected numericValues = (): LinkedValuesPair => {
        if (typeof this.values === 'number') return [finite(this.values), 0]
        const values = typeof this.values === 'string' ? textEntries(this.values).map(Number) : this.values
        return [finite(values[0]), finite(values[1])]
    }
    protected labelsForFields = (): readonly [string,string] => {
        const entries = textEntries(this.fieldLabels)
        return [entries[0] ?? '', entries[1] ?? '']
    }
    protected namesForFields = (): readonly string[] => textEntries(this.names)
    protected captureValue(): LinkedValuesPair { return this.numericValues() }
    protected restoreValue(value: LinkedValuesPair | FormRestoreValue): void {
        if (Array.isArray(value)) this.values = [...value]
        else if (value instanceof FormData) {
            const names = this.namesForFields(), current = this.numericValues()
            this.values = current.map((fallback, index) => {
                const restored = value.get(names[index] ?? '')
                return typeof restored === 'string' ? finite(Number(restored), fallback) : fallback
            })
        }
        this.captureRatio()
    }
    protected mount(): void {
        this.captureRatio()
        super.mount()
    }

    setLinked(linked: boolean, originalEvent?: Event): boolean {
        if (!this.canChangeValue() || bool(this.linked) === linked) return false
        const detail = { linked, originalEvent }
        if (!this.request('beforelinkchange', detail)) return false
        this.linked = linked
        if (linked) this.captureRatio()
        this.syncView()
        this.emit('linkchange', detail)
        return true
    }

    protected toggleLabel = (): string => { return scalarText(bool(this.linked) ? this.unlinkLabel : this.linkLabel) }

    protected syncFormValues(): void {
        const data = new FormData(), values = this.numericValues(), names = this.namesForFields()
        values.forEach((value, index) => { const name = names[index]; if (name) data.append(name, String(value)) })
        this.internals?.setFormValue(this.unavailable ? null : data, data)
    }
    protected syncFormValue(): void { this.syncFormValues() }

    setValueAt(index: 0 | 1, value: number, originalEvent?: Event): boolean {
        if ((index !== 0 && index !== 1) || !this.canChangeValue()) return false
        const previousValue = this.numericValues()
        if (previousValue.some((current, position) => current !== this.ratioValues[position])) this.captureRatio()
        const next = this.normalized(value)
        let first = index === 0 ? next : this.normalized(previousValue[0])
        let second = index === 1 ? next : this.normalized(previousValue[1])
        if (bool(this.linked)) {
            if (index === 0) second = this.normalized(first * this.ratio)
            else first = this.normalized(this.ratio ? second / this.ratio : second)
        }
        const nextValues: LinkedValuesPair = [first, second]
        return this.commitState(previousValue,nextValues,originalEvent,{index,linked:bool(this.linked)},changed=>{
            this.ratioValues = [...changed]
            this.values = [...changed]
        },(previous,changed)=>previous[0]===changed[0]&&previous[1]===changed[1])
    }
    private normalized(value: number): number {
        const minimum = finite(this.min, Number.NEGATIVE_INFINITY), maximum = finite(this.max, Number.POSITIVE_INFINITY)
        const step = Math.max(Number.EPSILON, finite(this.step, 1))
        const rounded = Math.round(finite(value) / step) * step
        return clamp(rounded, minimum, maximum)
    }
    private captureRatio(): void {
        this.ratioValues = this.numericValues()
        const [first, second] = this.ratioValues
        this.ratio = first === 0 ? 1 : second / first
    }
}
