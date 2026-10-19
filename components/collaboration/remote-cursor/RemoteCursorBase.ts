import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioKind } from '../../studio/types.js'

export interface RemoteCursorProps extends ComponentProps {}

/** Headless behavior for the Remote cursor component. */
export abstract class RemoteCursorBase extends Component<RemoteCursorProps> {
    readonly componentName = 'remote-cursor'
    readonly componentKind: StudioKind = 'canvas'
}
