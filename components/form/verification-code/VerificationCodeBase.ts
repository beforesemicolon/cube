import { FieldControlBase, type FieldControlProps, type FormRestoreValue } from '../FormControlBase.js'
import { finite, scalarText } from '../../core/value.js'

export type VerificationCodeMode = 'numeric' | 'alphabetic' | 'alphanumeric' | 'mixed'
export interface VerificationCodeProps extends FieldControlProps<string> {
    length?: number
    mode?: VerificationCodeMode
    pin?: boolean
    autocomplete?: string
}

/** One form value, presented as a configurable row of character cells. */
export abstract class VerificationCodeBase extends FieldControlBase<VerificationCodeProps> {
    static observedAttributes = [...FieldControlBase.observedAttributes, 'length', 'mode', 'pin', 'autocomplete']
    value = ''
    length = 6
    mode: VerificationCodeMode = 'numeric'
    pin = false
    autocomplete = 'one-time-code'

    protected codeLength = (): number => Math.max(1, Math.min(32, Math.floor(finite(this.length, 6))))
    protected characterClass = (): string => ({ numeric: '[0-9]', alphabetic: '[a-zA-Z]', alphanumeric: '[a-zA-Z0-9]', mixed: '[\\x21-\\x7e]' })[this.mode] ?? '[0-9]'
    protected clean = (value: string): string => (value.match(new RegExp(this.characterClass(), 'g')) ?? []).join('').slice(0, this.codeLength())
    protected code = (): string => this.clean(scalarText(this.value))
    protected normalizeValue(value: string): string { return this.clean(value) }
    protected captureValue(): string { return this.code() }
    protected restoreValue(value: FormRestoreValue): void { this.value = this.clean(value instanceof FormData ? scalarText(value.get(this.name)) : scalarText(value)) }
    protected serializedValue(): string { return this.code() }
    setValue(value: string, originalEvent?: Event): boolean { return this.handleChange(value, originalEvent) }
}
