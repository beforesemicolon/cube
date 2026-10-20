import { register } from '../core/Component.js'
import { Viewport } from './viewport/index.js'
import { Artboard } from './artboard/index.js'
import { Rulers } from './rulers/index.js'
import { DeviceFrame } from './device-frame/index.js'
import { Bezier } from './bezier/index.js'
import { Timeline } from './timeline/index.js'
import { PropertyGroup } from './property-group/index.js'
import { SelectionOverlay } from './selection-overlay/index.js'
import { GuideOverlay } from './guide-overlay/index.js'
import { MarqueeSelection } from './marquee-selection/index.js'
export * from './viewport/index.js'
export * from './artboard/index.js'
export * from './rulers/index.js'
export * from './device-frame/index.js'
export * from './bezier/index.js'
export * from './timeline/index.js'
export * from './property-group/index.js'
export * from './selection-overlay/index.js'
export * from './guide-overlay/index.js'
export * from './marquee-selection/index.js'

export function registerEditor(): void {
    register('cb-viewport', Viewport)
    register('cb-artboard', Artboard)
    register('cb-rulers', Rulers)
    register('cb-device-frame', DeviceFrame)
    register('cb-bezier', Bezier)
    register('cb-timeline', Timeline)
    register('cb-property-group', PropertyGroup)
    register('cb-selection-overlay', SelectionOverlay)
    register('cb-guide-overlay', GuideOverlay)
    register('cb-marquee-selection', MarqueeSelection)
}
