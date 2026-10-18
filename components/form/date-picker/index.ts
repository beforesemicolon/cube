import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DatePickerBase } from './DatePickerBase.js'

export class DatePicker extends DatePickerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-date-picker', DatePicker)
export { DatePickerBase }
export type { DatePickerProps } from './DatePickerBase.js'
