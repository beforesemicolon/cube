import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { TimePickerBase } from './TimePickerBase.js'

export class TimePicker extends TimePickerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-time-picker', TimePicker)
export { TimePickerBase }
export type { TimePickerProps } from './TimePickerBase.js'
