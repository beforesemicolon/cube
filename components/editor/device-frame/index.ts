import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { DeviceFrameBase } from './DeviceFrameBase.js'

export class DeviceFrame extends DeviceFrameBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-device-frame', DeviceFrame)
export { DeviceFrameBase }
export type { DeviceFrameProps } from './DeviceFrameBase.js'
