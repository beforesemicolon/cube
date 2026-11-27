import {
    NumericInputBase,
    type NumericInputProps,
    type NumericInputValue,
} from '../NumericInputBase.js'
import { normalizeRange } from '../model.js'
import type { StudioKind } from '../../studio/types.js'

export type RangeInputVariant = 'single' | 'double'
export type RangeInputValue = readonly [start: number, end: number]
export type RangeInputThumb = 'start' | 'end'
export type RangeInputChangeDetail = {
    originalEvent?: Event
} & (
    | {
          value: NumericInputValue
          previousValue: NumericInputValue
          thumb?: never
      }
    | {
          value: RangeInputValue
          previousValue: RangeInputValue
          thumb?: RangeInputThumb
      }
)

export interface RangeInputProps extends NumericInputProps {
    variant?: RangeInputVariant
    valueText?: string
    startValue?: number | null
    endValue?: number | null
    startLabel?: string
    endLabel?: string
}

type RangeEndpoints = readonly [number | null, number | null]

const endpoint = (value: number | FormDataEntryValue | null): number | null => {
    if (
        value === null ||
        typeof value === 'object' ||
        (typeof value === 'string' && !value.trim())
    )
        return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

/** Headless behavior for the Range input component. */
export abstract class RangeInputBase extends NumericInputBase<RangeInputProps> {
    static observedAttributes = [
        ...NumericInputBase.observedAttributes,
        'variant',
        'value-text',
        'start-value',
        'end-value',
        'start-label',
        'end-label',
    ]
    readonly componentName: string = 'range-input'
    readonly componentKind: StudioKind = 'range'
    variant: RangeInputVariant = 'single'
    valueText = ''
    startValue: number | null = null
    endValue: number | null = null
    startLabel = ''
    endLabel = ''
    private initialEndpoints?: RangeEndpoints

    protected isDouble = (): boolean => this.variant === 'double'

    protected get rangeBounds(): { min: number; max: number; step: number } {
        const { min, max } = normalizeRange({ min: this.min, max: this.max })
        const step = Number.isFinite(this.step) && this.step > 0 ? this.step : 1
        // A native range cannot land on a max that is off the step grid.
        const last =
            min +
            Math.floor(Number(((max - min) / step).toPrecision(14))) * step
        return {
            min,
            max: Math.max(min, Math.min(max, Number(last.toPrecision(14)))),
            step,
        }
    }

    private normalizeEndpoints(values: RangeEndpoints): RangeInputValue {
        const bounds = this.rangeBounds
        const a = normalizeRange({
            ...bounds,
            value: endpoint(values[0]) ?? bounds.min,
        }).value
        const b = normalizeRange({
            ...bounds,
            value: endpoint(values[1]) ?? bounds.max,
        }).value
        return a <= b ? [a, b] : [b, a]
    }

    /** The normalized ordered endpoints. This does not change the single variant's scalar value. */
    get rangeValue(): RangeInputValue {
        return this.normalizeEndpoints([this.startValue, this.endValue])
    }

    setValue(value: NumericInputValue, originalEvent?: Event): boolean {
        return this.isDouble() ? false : super.setValue(value, originalEvent)
    }

    /** Update both endpoints atomically through Cube's cancelable change contract. */
    setRangeValue(value: RangeInputValue, originalEvent?: Event): boolean {
        return this.commitRange(value, originalEvent)
    }

    private commitRange(
        value: RangeInputValue,
        event?: Event,
        thumb?: RangeInputThumb
    ): boolean {
        if (!this.isDouble() || !value.every(Number.isFinite)) return false
        return this.commitState(
            this.rangeValue,
            this.normalizeEndpoints(value),
            event,
            thumb ? { thumb } : {},
            ([start, end]) => {
                this.startValue = start
                this.endValue = end
            },
            ([a, b], [c, d]) => a === c && b === d
        )
    }

    protected setEndpoint(
        thumb: RangeInputThumb,
        value: number,
        event: Event
    ): boolean {
        if (!Number.isFinite(value)) return false
        const [start, end] = this.rangeValue
        return this.commitRange(
            thumb === 'start'
                ? [Math.min(value, end), end]
                : [start, Math.max(value, start)],
            event,
            thumb
        )
    }

    protected mount(): void {
        this.initialEndpoints ??= [this.startValue, this.endValue]
        super.mount()
    }

    formResetCallback(): void {
        if (this.initialEndpoints)
            [this.startValue, this.endValue] = this.initialEndpoints
        super.formResetCallback()
    }

    protected restoreValue(
        value: number | FormDataEntryValue | FormData | null
    ): void {
        if (this.isDouble() && value instanceof FormData) {
            const values = value.getAll(this.name)
            if (values.length === 2) {
                this.startValue = endpoint(values[0] ?? null)
                this.endValue = endpoint(values[1] ?? null)
            }
            return
        }
        super.restoreValue(value)
    }

    protected serializedValue(): string | File | FormData | null {
        if (!this.isDouble()) return super.serializedValue()
        const data = new FormData()
        if (this.name)
            for (const value of this.rangeValue)
                data.append(this.name, String(value))
        return data
    }
}
