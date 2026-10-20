import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, finite, scalarText } from '../../core/value.js'

export type DevicePreset = 'desktop' | 'tablet' | 'mobile' | 'custom'
export type DeviceOrientation = 'portrait' | 'landscape'

export interface DeviceFrameProps extends ComponentProps {
    device?: DevicePreset
    orientation?: DeviceOrientation
    width?: number
    height?: number
    showChrome?: boolean
    showOrientationControl?: boolean
    orientationLabel?: string
    screenLabel?: string
}

const presetSizes: Readonly<Record<Exclude<DevicePreset, 'custom'>, readonly [number, number]>> = {
    desktop: [1440, 900], tablet: [768, 1024], mobile: [390, 844],
}

/** Headless device sizing and orientation behavior. */
export abstract class DeviceFrameBase extends Component<DeviceFrameProps> {
    static observedAttributes = [
        ...Component.observedAttributes, 'device', 'orientation', 'width', 'height', 'show-chrome', 'show-orientation-control',
        'orientation-label', 'screen-label',
    ]

    device: DevicePreset = 'desktop'
    orientation: DeviceOrientation = 'landscape'
    width = 1280
    height = 720
    showChrome = true
    showOrientationControl = true
    orientationLabel = ''
    screenLabel = ''

    protected preset = (): DevicePreset => { return ['desktop','tablet','mobile','custom'].includes(this.device) ? this.device : 'desktop' }
    protected frameSize(): readonly [number, number] {
        const preset = this.preset()
        let size: readonly [number, number] = preset === 'custom' ? [Math.max(1, finite(this.width, 1280)), Math.max(1, finite(this.height, 720))] : presetSizes[preset]
        const portrait = this.orientation === 'portrait'
        const width = portrait ? Math.min(size[0], size[1]) : Math.max(size[0], size[1])
        const height = portrait ? Math.max(size[0], size[1]) : Math.min(size[0], size[1])
        return [width, height]
    }
    protected chromeVisible(): boolean { return bool(this.showChrome, true) }
    protected orientationControlVisible = (): boolean => { return bool(this.showOrientationControl, true) }
    protected text(name: 'orientationLabel' | 'screenLabel'): string { return scalarText(this[name]) }

    toggleOrientation(originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const orientation: DeviceOrientation = this.orientation === 'portrait' ? 'landscape' : 'portrait'
        const detail = { value: orientation, previousValue: this.orientation, orientation, originalEvent }
        if (!this.request('beforechange', detail)) return false
        this.orientation = orientation
        this.syncView()
        this.emit('change', detail)
        return true
    }
}
