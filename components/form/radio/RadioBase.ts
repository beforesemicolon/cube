import { scalarText } from '../../core/value.js'
import {
    ChoiceControlBase,
    type ChoiceControlProps,
} from '../ChoiceControlBase.js'
import type { StudioKind } from '../../studio/types.js'
import type { ControlSize } from '../../core/Component.js'

export interface RadioProps extends ChoiceControlProps {}

interface RadioSelectionDetail {
    readonly source: RadioBase
}

const radioSelectionEvent = 'cube-radio-select'

/** Headless behavior for a standalone radio control. */
export abstract class RadioBase extends ChoiceControlBase<RadioProps> {
    readonly componentName = 'radio'
    readonly componentKind: StudioKind = 'choice'
    size: ControlSize = 'xs'

    private sameGroup(source: RadioBase): boolean {
        const name = scalarText(this.name)

        return (
            Boolean(name) &&
            scalarText(source.name) === name &&
            source.form === this.form &&
            source.getRootNode() === this.getRootNode()
        )
    }

    private handleGroupSelection = (event: Event): void => {
        if (!(event instanceof CustomEvent)) return

        const { source } = event.detail as RadioSelectionDetail
        if (source === this || !this.checked || !this.sameGroup(source)) return

        this.checked = false
        this.syncView()
        this.syncFormValue()
    }

    private selectGroup(): void {
        this.ownerDocument.dispatchEvent(
            new CustomEvent<RadioSelectionDetail>(radioSelectionEvent, {
                detail: { source: this },
            })
        )
    }

    protected mount(): void {
        this.listen(
            this.ownerDocument,
            radioSelectionEvent,
            this.handleGroupSelection
        )
        super.mount()
        if (this.checked) this.selectGroup()
    }

    protected update(name: string): void {
        super.update(name)
        if (name === 'checked' && this.checked) this.selectGroup()
    }

    setChecked(checked: boolean, originalEvent?: Event): boolean {
        const changed = super.setChecked(checked, originalEvent)
        if (changed && checked) this.selectGroup()
        return changed
    }
}
