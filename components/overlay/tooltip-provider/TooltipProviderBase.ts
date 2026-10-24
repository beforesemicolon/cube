import { Component, type CommonProps } from '../../core/Component.js'
import { bool } from '../../core/value.js'

export interface TooltipProviderProps extends CommonProps { enabled?: boolean; delay?: number }

/** Opt-in scope for automatic button tooltips, including composed child controls. */
export abstract class TooltipProviderBase<P extends TooltipProviderProps = TooltipProviderProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'enabled', 'delay']
    enabled = true
    delay = 400
    protected tooltipsEnabled = (): boolean => bool(this.enabled) && !this.unavailable
}
