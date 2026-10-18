import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DeviceSelectorBase } from './DeviceSelectorBase.js'

export class DeviceSelector extends DeviceSelectorBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-device-selector', DeviceSelector)
export { DeviceSelectorBase }
export type { DeviceSelectorProps } from './DeviceSelectorBase.js'
