import { NumericInputBase, type NumericInputProps } from '../NumericInputBase.js'
import type { StudioKind } from '../../studio/types.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'
import { bool } from '../../core/value.js'

export type UnitOption = string | SelectOption

export interface UnitInputProps extends NumericInputProps, PopupConstraintProps {
    unit?: string
    units?: readonly UnitOption[]
    unitLabel?: string
}

/** Headless behavior for the Unit input component. */
export abstract class UnitInputBase extends NumericInputBase<UnitInputProps> {
    static observedAttributes = [...NumericInputBase.observedAttributes, 'unit', 'units', 'unit-label', ...popupConstraintAttributes]
    unit = ''
    units: readonly UnitOption[] = []
    unitLabel = ''
    popupMaxWidth: PopupLength = '160px'
    popupMaxHeight: PopupLength = '240px'
    readonly componentName = 'unit-input'
    readonly componentKind: StudioKind = 'number'

    get normalizedUnits(): ReadonlyArray<Required<SelectOption>> {
        return normalizeOptions(this.units)
    }

    get selectedUnit(): string {
        const selected = String(this.unit ?? '')
        if (!this.normalizedUnits.length || this.normalizedUnits.some(option => option.value === selected)) return selected
        return this.normalizedUnits.find(option => !option.disabled)?.value ?? ''
    }

    chooseUnit(unit: string, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const selected = String(unit ?? '')
        const options = this.normalizedUnits
        if (options.length && !options.some(option => option.value === selected && !option.disabled)) return false
        const detail = { unit: selected, originalEvent }
        if (!this.request('beforeunitchange', detail)) {
            this.syncView()
            return false
        }
        this.unit = selected
        this.syncView()
        this.emit('unitchange', detail)
        return true
    }
}
