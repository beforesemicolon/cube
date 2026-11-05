import { TextReferenceController } from '../text-references.js'
import { plainText, resolveReferences, type RichTextReference } from '../rich-text-editor/model.js'
import { MentionController, type MentionConfiguration } from '../../core/mentions.js'
import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'
import {
    FieldControlBase,
    type FieldControlProps,
    type FormRestoreValue,
} from '../FormControlBase.js'

export interface TextareaProps extends FieldControlProps<string> {
    references?: readonly RichTextReference[]
    mentions?: MentionConfiguration | null
    placeholder?: string
}

/** Headless behavior for the Textarea component. */
export abstract class TextareaBase extends FieldControlBase<TextareaProps> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes,
        'mentions',
        'references',
        'placeholder',
        'autocomplete',
    ]
    value = ''
    references: readonly RichTextReference[] = []
    mentions: MentionConfiguration | null = null
    protected referenceController?: TextReferenceController
    displayValue = (): string => plainText(resolveReferences([{ text: this.value, formats: [] }], this.references, false))
    private mentionController?: MentionController
    protected mount(): void {
        super.mount()
        const control = this.fieldElement()
        if (control) {
            this.referenceController = new TextReferenceController(control, () => this.value, () => this.references, (value, event) => this.setValue(value, event))
            this.mentionController = new MentionController(this.referenceController.adapter, () => this.mentions)
        }
        this.cleanup(() => { this.mentionController?.dispose(); this.mentionController = undefined; this.referenceController?.dispose(); this.referenceController = undefined })
    }
    protected update(name: string): void { super.update(name); this.mentionController?.refresh() }
    placeholder = ''
    readonly componentName = 'textarea'
    readonly componentKind: StudioKind = 'textarea'
    protected fieldElement(): HTMLTextAreaElement | undefined {
        return this.refs.control?.[0] instanceof HTMLTextAreaElement
            ? this.refs.control[0]
            : undefined
    }
    protected captureValue(): string {
        return this.value
    }
    protected restoreValue(value: string | FormRestoreValue): void {
        this.value =
            value instanceof FormData
                ? scalarText(value.get(this.name))
                : value instanceof File
                  ? value.name
                  : scalarText(value)
    }
    setValue(value: string, originalEvent?: Event): boolean {
        return this.handleChange(value, originalEvent)
    }
    setControlValue(value: StudioValue, originalEvent?: Event): boolean {
        return originalEvent && this.referenceController ? this.referenceController.input(scalarText(value), originalEvent) : this.setValue(scalarText(value), originalEvent)
    }
}
