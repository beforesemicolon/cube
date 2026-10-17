import { UIComponent, type UIProps } from '../../core/UIComponent.js'
export interface IconProps extends UIProps { name?: string }
export abstract class IconBase extends UIComponent<IconProps> {
    static observedAttributes=[...UIComponent.observedAttributes,'name']
    name=''
}
