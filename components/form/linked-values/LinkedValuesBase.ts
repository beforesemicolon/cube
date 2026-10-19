import { FormControlBase, type FormControlProps, type FormRestoreValue } from '../FormControlBase.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export interface LinkedValuesProps extends FormControlProps {
    firstValue?: number
    secondValue?: number
    firstName?: string
    secondName?: string
    firstLabel?: string
    secondLabel?: string
    linked?: boolean
    min?: number
    max?: number
    step?: number
    linkLabel?: string
    unlinkLabel?: string
}

/** Coupled numeric-value behavior for dimensions, offsets and other paired properties. */
export abstract class LinkedValuesBase<P extends LinkedValuesProps = LinkedValuesProps> extends FormControlBase<P, readonly [number, number]> {
    static observedAttributes = [
        ...FormControlBase.observedAttributes, 'first-value', 'second-value', 'first-name', 'second-name', 'first-label', 'second-label',
        'linked', 'min', 'max', 'step', 'link-label', 'unlink-label',
    ]
    firstValue = 0
    secondValue = 0
    firstName = ''
    secondName = ''
    firstLabel = ''
    secondLabel = ''
    linked = false
    min = Number.NEGATIVE_INFINITY
    max = Number.POSITIVE_INFINITY
    step = 1
    linkLabel = ''
    unlinkLabel = ''
    private ratio = 1
    protected fieldElement(): undefined { return undefined }
    protected captureValue(): readonly [number, number] { return [finite(this.firstValue), finite(this.secondValue)] }
    protected restoreValue(value: readonly [number, number] | FormRestoreValue): void {
        if (Array.isArray(value)) [this.firstValue, this.secondValue] = value
        else if (value instanceof FormData) {
            this.firstValue = finite(Number(value.get(this.firstName)), this.firstValue)
            this.secondValue = finite(Number(value.get(this.secondName)), this.secondValue)
        }
        this.captureRatio()
    }
    protected mount(): void {
        this.captureRatio()
        super.mount()
    }

    setLinked(linked: boolean, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.linked) === linked) return false
        const detail = { linked, originalEvent }
        if (!this.request('cb-before-link-change', detail)) return false
        this.linked = linked
        if (linked) this.captureRatio()
        this.syncView()
        this.emit('cb-link-change', detail)
        return true
    }

    setFirst(value: number, originalEvent?: Event): boolean { return this.change('first', value, originalEvent) }
    setSecond(value: number, originalEvent?: Event): boolean { return this.change('second', value, originalEvent) }
    protected toggleLabel(): string { return scalarText(bool(this.linked) ? this.unlinkLabel : this.linkLabel) }

    protected syncFormValues(): void {
        const data = new FormData()
        if (this.firstName) data.append(this.firstName, String(this.firstValue))
        if (this.secondName) data.append(this.secondName, String(this.secondValue))
        this.internals?.setFormValue(this.unavailable ? null : data, data)
    }
    protected syncFormValue(): void { this.syncFormValues() }

    private change(source: 'first' | 'second', value: number, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const next = this.normalized(value)
        let firstValue = source === 'first' ? next : this.normalized(this.firstValue)
        let secondValue = source === 'second' ? next : this.normalized(this.secondValue)
        if (bool(this.linked)) {
            if (source === 'first') secondValue = this.normalized(firstValue * this.ratio)
            else firstValue = this.normalized(this.ratio ? secondValue / this.ratio : secondValue)
        }
        const detail = { firstValue, secondValue, source, linked: bool(this.linked), originalEvent }
        if (!this.request('cb-before-change', detail)) return false
        this.firstValue = firstValue; this.secondValue = secondValue
        this.syncView(); this.emit('cb-change', detail); return true
    }
    private normalized(value: number): number {
        const minimum = finite(this.min, Number.NEGATIVE_INFINITY), maximum = finite(this.max, Number.POSITIVE_INFINITY)
        const step = Math.max(Number.EPSILON, finite(this.step, 1))
        const rounded = Math.round(finite(value) / step) * step
        return clamp(rounded, minimum, maximum)
    }
    private captureRatio(): void {
        const first = finite(this.firstValue), second = finite(this.secondValue)
        this.ratio = first === 0 ? 1 : second / first
    }
}
