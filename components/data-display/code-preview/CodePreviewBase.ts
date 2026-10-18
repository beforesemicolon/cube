import { StudioComponentBase } from '../../studio/StudioComponentBase.js'
import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioProps } from '../../studio/types.js'

export interface CodePreviewProps extends StudioProps {
    code?: string
    codeLanguage?: string
    copyLabel?: string
    copiedLabel?: string
}

/** Headless behavior for the Code preview component. */
export abstract class CodePreviewBase extends StudioComponentBase<CodePreviewProps> {
    static observedAttributes = [...StudioComponentBase.observedAttributes, 'code', 'code-language', 'copy-label', 'copied-label']
    readonly componentName = 'code-preview'
    readonly componentKind: StudioKind = 'display'
    code = ''
    codeLanguage = 'plaintext'
    copyLabel = ''
    copiedLabel = ''

    source(): string { return scalarText(this.code) || this.studioTextValue() }
    copyText(): string { return scalarText(this.copyLabel) }
    copiedText(): string { return scalarText(this.copiedLabel) }
}
