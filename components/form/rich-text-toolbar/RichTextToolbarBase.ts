import { Component, type CommonProps } from '../../core/Component.js'
import type { RichTextFormat } from '../rich-text-editor/model.js'

export interface RichTextToolbarProps extends CommonProps {
    activeFormats?: readonly RichTextFormat[]
    boldLabel?: string
    italicLabel?: string
    underlineLabel?: string
    strikethroughLabel?: string
    superscriptLabel?: string
    subscriptLabel?: string
}
export abstract class RichTextToolbarBase extends Component<RichTextToolbarProps> {
    static observedAttributes = [...Component.observedAttributes, 'active-formats', 'bold-label', 'italic-label', 'underline-label', 'strikethrough-label', 'superscript-label', 'subscript-label']
    activeFormats: readonly RichTextFormat[] = []
    boldLabel = ''
    italicLabel = ''
    underlineLabel = ''
    strikethroughLabel = ''
    superscriptLabel = ''
    subscriptLabel = ''
}
