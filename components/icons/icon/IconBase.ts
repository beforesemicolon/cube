import { Component, type ComponentProps } from '../../core/Component.js'
export interface IconProps extends ComponentProps { name?: string }
export abstract class IconBase extends Component<IconProps> {
    static observedAttributes=[...Component.observedAttributes,'name']
    name=''
}
