import { Component, type CommonProps } from '../../core/Component.js'
import { scalarText } from '../../core/value.js'

export interface ShortcutProps extends CommonProps { keys?: string; accessibleLabel?: string }

/** Keyboard-shortcut parsing without prescribing keycap rendering. */
export abstract class ShortcutBase<P extends ShortcutProps = ShortcutProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'keys', 'accessible-label']
    keys = ''
    accessibleLabel = ''
    protected keyList(): string[] { return scalarText(this.keys).split('+').map(key => key.trim()).filter(Boolean).slice(0, 8) }
}
