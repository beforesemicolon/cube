import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { finite, scalarText } from '../../core/value.js'

export interface ActionBarProps extends UIProps { selectionCount?: number; busy?: boolean; status?: string }

/** Selection/status behavior for contextual action surfaces. */
export abstract class ActionBarBase<P extends ActionBarProps = ActionBarProps> extends UIComponent<P> {
    static observedAttributes = [...UIComponent.observedAttributes, 'selection-count', 'busy', 'status']
    selectionCount = 0
    busy = false
    status = ''
    protected statusText(): string {
        return scalarText(this.status)
    }
}
