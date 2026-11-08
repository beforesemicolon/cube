import { ChoiceControlBase, type ChoiceControlProps } from '../ChoiceControlBase.js'
import type { StudioKind } from '../../studio/types.js'
import type { ControlSize } from '../../core/Component.js'

export interface CheckboxProps extends ChoiceControlProps {
    indeterminate?: boolean
}

/** Headless behavior for the Checkbox component. */
export abstract class CheckboxBase extends ChoiceControlBase<CheckboxProps> {
    static observedAttributes = [
        ...ChoiceControlBase.observedAttributes,
        'indeterminate',
    ]
    readonly componentName = 'checkbox'
    readonly componentKind: StudioKind = 'choice'
    indeterminate = false
    size: ControlSize = 'xs'

    setChecked(checked: boolean, originalEvent?: Event): boolean {
        return this.commitState(
            this.checked,
            checked,
            originalEvent,
            { checked },
            value => {
                this.checked = value
                if (originalEvent) this.indeterminate = false
            }
        )
    }
}
