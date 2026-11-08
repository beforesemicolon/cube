import { clamp, finite, record, text, bool, scalarText } from '../core/value.js'
export interface RangeOptions {
    min?: number
    max?: number
    step?: number | 'any'
    value?: number
}
export interface NormalizedRange {
    min: number
    max: number
    step: number | 'any'
    value: number
    percent: number
}
export function normalizeRange(input: RangeOptions): NormalizedRange {
    const min = finite(input.min, 0),
        max = Math.max(min, finite(input.max, 100))
    const step: number | 'any' =
        input.step === 'any'
            ? 'any'
            : Math.max(
                  Number.EPSILON,
                  finite(input.step, 1) > 0 ? finite(input.step, 1) : 1
              )
    let value = clamp(finite(input.value, min), min, max)
    if (step !== 'any')
        value = clamp(
            Number(
                (min + Math.round((value - min) / step) * step).toPrecision(14)
            ),
            min,
            max
        )
    return {
        min,
        max,
        step,
        value,
        percent: max === min ? 0 : ((value - min) / (max - min)) * 100,
    }
}
export interface SelectOption {
    value?: string
    label?: string
    selectedLabel?: string
    description?: string
    badge?: string
    disabled?: boolean
    group?: string
    icon?: string
}
export type NormalizedSelectOption = Required<Omit<SelectOption, 'icon'>> &
    Pick<SelectOption, 'icon'>
export function normalizeOptions(input: unknown): NormalizedSelectOption[] {
    if (!Array.isArray(input)) return []
    const seen = new Set<string>()
    return input.flatMap((raw) => {
        if (
            typeof raw !== 'string' &&
            (raw === null || typeof raw !== 'object' || Array.isArray(raw))
        )
            return []
        const item =
            typeof raw === 'string' ? { value: raw, label: raw } : record(raw)
        if (!Object.hasOwn(item, 'value') && !text(item.label)) return []
        const value = scalarText(item.value, scalarText(item.label)),
            label = scalarText(item.label, value)
        if (seen.has(value)) return []
        seen.add(value)
        const icon = text(item.icon)
        return [
            {
                value,
                label,
                selectedLabel: scalarText(item.selectedLabel, label),
                description: text(item.description),
                badge: text(item.badge),
                disabled: bool(item.disabled),
                group: text(item.group),
                ...(icon ? { icon } : {}),
            },
        ]
    })
}
