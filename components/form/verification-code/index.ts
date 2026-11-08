import { register } from '../../core/Component.js'
import { html, repeat, state, type Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import { VerificationCodeBase } from './VerificationCodeBase.js'
import componentStylesheet from './styles.css?inline'

export class VerificationCode extends VerificationCodeBase {
    stylesheet = componentStylesheet
    private readonly focused: ReturnType<typeof state<boolean>> = state(false)
    private readonly position: ReturnType<typeof state<number>> = state(0)
    private caret = -1
    protected fieldElement(): HTMLInputElement | undefined {
        const input = this.refs.input?.[0]
        return input instanceof HTMLInputElement ? input : undefined
    }
    private masked = (index: number): boolean => bool(this.pin) && (!this.focused[0]() || Math.min(this.position[0](), this.codeLength() - 1) !== index)
    private invalid = (): boolean => !this.unavailable && !bool(this.readOnly) && Boolean(this.errorText || (this.validationShown &&
        (this.code().length > 0 || bool(this.required)) && this.code().length !== this.codeLength()))
    private valid = (): boolean => !this.unavailable && !this.invalid() && !this.errorText && this.code().length === this.codeLength()
    private selection = (): void => {
        const input = this.fieldElement(), cursor = input?.selectionStart ?? 0
        // Native select/keyup events following an edit must not advance the PIN
        // reveal beyond the character just entered. Real navigation still does.
        if (!bool(this.pin) || cursor !== this.caret || input?.selectionEnd !== cursor) this.position[1](cursor)
        this.caret = cursor
    }
    private edited = (input: HTMLInputElement, cursor: number, revealEntered: boolean): void => {
        input.setSelectionRange(cursor, cursor)
        this.caret = cursor
        this.position[1](bool(this.pin) && revealEntered ? Math.max(0, cursor - 1) : cursor)
    }
    private showValidation = (): void => { this.validationShown = true }
    private input = (event: Event): void => {
        const input = this.fieldElement()
        if (!input || (event instanceof InputEvent && event.isComposing)) return
        const cursor = this.clean(input.value.slice(0, input.selectionStart ?? input.value.length)).length
        const accepted = this.setValue(input.value, event)
        input.value = this.code()
        this.edited(input, Math.min(cursor, input.value.length), accepted && !(event instanceof InputEvent && event.inputType.startsWith('delete')))
    }
    private paste = (event: ClipboardEvent): void => {
        const input = this.fieldElement()
        if (!input || this.unavailable || bool(this.readOnly) || !event.clipboardData) return
        event.preventDefault()
        const pasted = this.clean(event.clipboardData.getData('text'))
        if (!pasted) return
        const start = input.selectionStart ?? 0, end = input.selectionEnd ?? start
        this.setValue(input.value.slice(0, start) + pasted + input.value.slice(end), event)
        input.value = this.code()
        const cursor = Math.min(start + pasted.length, input.value.length)
        this.edited(input, cursor, true)
    }
    private point = (event: PointerEvent): void => {
        const input = this.fieldElement()
        if (!input || this.unavailable) return
        event.preventDefault()
        input.focus()
        const box = input.getBoundingClientRect()
        const index = Math.max(0, Math.min(this.code().length, Math.floor((event.clientX - box.left) / box.width * this.codeLength())))
        input.setSelectionRange(index, Math.min(index + 1, input.value.length))
        this.selection()
    }
    private keydown = (event: KeyboardEvent): void => {
        if (event.key !== 'Enter' || event.isComposing || this.unavailable || !this.form) return
        event.preventDefault()
        this.form.requestSubmit()
    }
    protected mount(): void {
        super.mount()
        const input = this.fieldElement()
        if (input) this.listen(input, 'compositionend', this.input)
        this.listen(this, 'invalid', this.showValidation)
    }
    render(): Template {
        return html`<div part="control" style=${() => `--cb-code-length:${this.codeLength()}`}>
            <input ref="input" part="input" type=${() => bool(this.pin) ? 'password' : 'text'} value=${this.code}
                name=${this.props.name} autocomplete=${this.props.autocomplete} inputmode=${() => this.mode === 'numeric' ? 'numeric' : 'text'}
                maxlength=${this.codeLength} pattern=${() => `${this.characterClass()}{${this.codeLength()}}`}
                disabled=${this.controlUnavailable} readonly=${this.props.readOnly} required=${this.props.required}
                aria-label=${this.accessibleName} aria-description=${() => scalarText(this.description) || null}
                aria-invalid=${() => this.invalid() ? 'true' : null} spellcheck="false" autocapitalize="off"
                oninput=${this.input} onpaste=${this.paste} onpointerdown=${this.point}
                onfocus=${() => { this.focused[1](true); this.selection() }}
                onblur=${() => { this.focused[1](false); this.caret = -1; this.validationShown = true }}
                onselect=${this.selection} onkeyup=${this.selection} onkeydown=${this.keydown}>
            <div part="cells" aria-hidden="true">
                ${repeat(() => Array.from({ length: this.codeLength() }, (_, index) => index), index => html`
                    <span part="cell" data-active=${() => this.focused[0]() && Math.min(this.position[0](), this.codeLength() - 1) === index ? 'true' : null}
                        data-empty=${() => !this.code()[index] ? 'true' : null}
                        data-valid=${() => this.valid() ? 'true' : null}
                        data-invalid=${() => this.invalid() ? 'true' : null}>${() => this.code()[index] ? this.masked(index) ? '•' : this.code()[index] : ''}</span>
                `)}
            </div>
        </div>`
    }
}
export { VerificationCodeBase }
export type { VerificationCodeProps, VerificationCodeMode } from './VerificationCodeBase.js'
register('cb-verification-code', VerificationCode)
