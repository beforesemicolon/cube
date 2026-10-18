import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'
import { normalizeOptions, type SelectOption } from '../model.js'
import { popupConstraintAttributes, type PopupConstraintProps, type PopupLength } from '../../core/popup.js'

export type UnitOption = string | SelectOption

export interface UnitInputProps extends StudioProps, PopupConstraintProps {
    unit?: string
    units?: readonly UnitOption[]
    unitLabel?: string
}

/** Headless behavior for the Unit input component. */
export abstract class UnitInputBase extends StudioComponentBase<UnitInputProps> {
    static observedAttributes = [...StudioComponentBase.observedAttributes, 'unit', 'units', 'unit-label', ...popupConstraintAttributes]
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
        if (this.studioDisabled() || this.studioReadOnly()) return false
        const selected = String(unit ?? '')
        const options = this.normalizedUnits
        if (options.length && !options.some(option => option.value === selected && !option.disabled)) return false
        const detail = { unit: selected, originalEvent }
        if (!this.request('cb-before-unit-change', detail)) {
            this.syncView()
            return false
        }
        this.unit = selected
        this.syncView()
        this.emit('cb-unit-change', detail)
        return true
    }
}
