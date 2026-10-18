import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ProjectPickerBase } from './ProjectPickerBase.js'

export class ProjectPicker extends ProjectPickerBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-project-picker', ProjectPicker)
export { ProjectPickerBase }
export type { ProjectPickerProps } from './ProjectPickerBase.js'
