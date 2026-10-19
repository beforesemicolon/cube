import { Component, type ComponentProps } from '../../core/Component.js'
import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'

export interface CodePreviewProps extends ComponentProps {
    value?: StudioValue
    code?: string
    codeLanguage?: string
    copyLabel?: string
    copiedLabel?: string
}

/** Headless behavior for the Code preview component. */
export abstract class CodePreviewBase extends Component<CodePreviewProps> {
    static observedAttributes = [...Component.observedAttributes, 'value', 'code', 'code-language', 'copy-label', 'copied-label']
    readonly componentName = 'code-preview'
    readonly componentKind: StudioKind = 'display'
    code = ''
    codeLanguage = 'plaintext'
    copyLabel = ''
    copiedLabel = ''
    value: StudioValue = ''

    source = (): string => {
        const value = Array.isArray(this.value) ? this.value.join(', ') : scalarText(this.value)
        return scalarText(this.code) || value
    }
    copyText = (): string => { return scalarText(this.copyLabel) }
    copiedText(): string { return scalarText(this.copiedLabel) }
}
