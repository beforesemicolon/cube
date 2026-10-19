import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'

export interface DescriptionRowProps extends ComponentProps { value?: StudioValue }

/** Headless behavior for the Description row component. */
export abstract class DescriptionRowBase extends Component<DescriptionRowProps> {
    static observedAttributes = [...Component.observedAttributes, 'value']
    value: StudioValue = ''
    readonly componentName = 'description-row'
    readonly componentKind: StudioKind = 'display'
}
