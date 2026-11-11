import { TextReferenceController } from '../text-references.js'
import {
    plainText,
    resolveReferences,
    type RichTextReference,
} from '../rich-text-editor/model.js'
import {
    MentionController,
    type MentionConfiguration,
} from '../../core/mentions.js'
import { scalarText } from '../../core/value.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'
import {
    FieldControlBase,
    type FieldControlProps,
    type FormRestoreValue,
} from '../FormControlBase.js'

export interface TextInputProps extends FieldControlProps<string> {
    references?: readonly RichTextReference[]
    mentions?: MentionConfiguration | null
    placeholder?: string
    type?: string
    autocomplete?: string
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: string
    max?: string
    step?: string
    inputMode?: string
    icon?: string
    width?: string
}

/** Headless behavior for the Text input component. */
export abstract class TextInputBase extends FieldControlBase<TextInputProps> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes,
        'mentions',
        'references',
        'placeholder',
        'type',
        'autocomplete',
        'pattern',
        'min-length',
        'max-length',
        'min',
        'max',
        'step',
        'input-mode',
        'icon',
        'width',
    ]
    value = ''
    references: readonly RichTextReference[] = []
    mentions: MentionConfiguration | null = null
    protected referenceController?: TextReferenceController
    displayValue = (): string =>
        plainText(
            resolveReferences(
                [{ text: this.value, formats: [] }],
                this.references,
                true
            )
        )
    private mentionController?: MentionController
    protected mount(): void {
        super.mount()
        const control = this.fieldElement()
        if (control) {
            this.referenceController = new TextReferenceController(
                control,
                () => this.value,
                () => this.references,
                (value, event) => this.setValue(value, event)
            )
            this.mentionController = new MentionController(
                this.referenceController.adapter,
                () => this.mentions
            )
        }
        this.cleanup(() => {
            this.mentionController?.dispose()
            this.mentionController = undefined
            this.referenceController?.dispose()
            this.referenceController = undefined
        })
    }
    protected update(name: string): void {
        super.update(name)
        this.mentionController?.refresh()
    }
    placeholder = ''
    type = 'text'
    autocomplete = ''
    pattern = ''
    minLength: number | string = ''
    maxLength: number | string = ''
    min = ''
    max = ''
    step = ''
    inputMode = ''
    icon = ''
    width = ''
    readonly componentName = 'text-input'
    readonly componentKind: StudioKind = 'text'
    protected fieldElement(): HTMLInputElement | undefined {
        return this.refs.control?.[0] instanceof HTMLInputElement
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
        return originalEvent && this.referenceController
            ? this.referenceController.input(scalarText(value), originalEvent)
            : this.setValue(scalarText(value), originalEvent)
    }
}
