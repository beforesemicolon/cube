import type { MentionConfiguration } from '../../core/mentions.js'
import {
    FieldControlBase,
    type FieldControlProps,
    type FormRestoreValue,
} from '../FormControlBase.js'
import { SourceValueController } from '../source-value.js'
import { scalarText } from '../../core/value.js'
import { parseRichText } from './html.js'
import { serializeRuns, type RichTextReference } from './model.js'

export type RichTextEditorVariant = 'inline' | 'box'
export interface RichTextEditorProps extends FieldControlProps<string> {
    references?: readonly RichTextReference[]
    mentions?: MentionConfiguration | null
    variant?: RichTextEditorVariant
    placeholder?: string
    toolbarLabel?: string
    boldLabel?: string
    italicLabel?: string
    underlineLabel?: string
    strikethroughLabel?: string
    superscriptLabel?: string
    subscriptLabel?: string
}
export abstract class RichTextEditorBase extends FieldControlBase<RichTextEditorProps> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes,
        'mentions',
        'references',
        'variant',
        'placeholder',
        'toolbar-label',
        'bold-label',
        'italic-label',
        'underline-label',
        'strikethrough-label',
        'superscript-label',
        'subscript-label',
    ]
    declare value: string
    references: readonly RichTextReference[] = []
    mentions: MentionConfiguration | null = null
    variant: RichTextEditorVariant = 'inline'
    placeholder = ''
    toolbarLabel = ''
    boldLabel = ''
    italicLabel = ''
    underlineLabel = ''
    strikethroughLabel = ''
    superscriptLabel = ''
    subscriptLabel = ''
    private readonly source: SourceValueController<string>
    constructor() {
        super()
        this.source = new SourceValueController(this, '', value => this.cleanValue(scalarText(value)), value => value,
            () => { this.syncView(); this.syncFormValue() })
    }
    protected inlineMode = (): boolean => this.variant !== 'box'
    protected cleanValue = (value: string): string => serializeRuns(parseRichText(scalarText(value), this.ownerDocument, this.inlineMode()))
    protected normalizeValue(value: string): string { return this.cleanValue(value) }
    protected captureValue(): string { return this.cleanValue(this.value) }
    protected restoreValue(value: string | FormRestoreValue): void {
        this.source.set(this.cleanValue(value instanceof FormData ? scalarText(value.get(this.name)) : value instanceof File ? value.name : scalarText(value)), false)
    }
    protected normalizeSource = (): void => {
        const value = this.cleanValue(this.value)
        if (value !== this.value) this.source.set(value, false)
    }
    protected mount(): void { this.source.mount(); this.normalizeSource(); super.mount() }
    protected update(name: string): void {
        if (name === 'value') {
            if (this.source.isReflecting) return
            this.source.readAttribute()
        }
        super.update(name)
    }
    setValue = (value: string, originalEvent?: Event): boolean => this.commitValue(value, originalEvent, {}, next => { this.source.set(next, false) })
}
