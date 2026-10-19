import { Component, type ComponentProps } from '../../core/Component.js'
import type { StudioItem, StudioKind, StudioValue } from '../../studio/types.js'

export interface TokenInputProps extends ComponentProps {
    value?: StudioValue
    items?: readonly StudioItem[]
    emptyLabel?: string
    readOnly?: boolean
}

/** Headless behavior for the Token input component. */
export abstract class TokenInputBase extends Component<TokenInputProps> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'items', 'empty-label', 'read-only']
    value: StudioValue = ''
    items: readonly StudioItem[] = []
    emptyLabel = ''
    readOnly = false
    readonly componentName = 'token-input'
    readonly componentKind: StudioKind = 'tokens'
}
