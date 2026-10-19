import { Component, type ComponentProps } from '../core/Component.js'
import type { StudioValue } from '../studio/types.js'

export interface MessageProps extends ComponentProps {
    value?: StudioValue
    status?: string
}

/** Primary and supporting copy shared by compact feedback messages. */
export abstract class MessageBase<P extends MessageProps = MessageProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'status']
    value: StudioValue = ''
    status = ''
}
