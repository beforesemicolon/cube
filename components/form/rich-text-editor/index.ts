import { register } from '../../core/Component.js'
import { html, state, or, type Template } from '../../core/runtime.js'
import { bool, scalarText } from '../../core/value.js'
import componentStylesheet from './styles.css?inline'
import { RichTextEditorBase } from './RichTextEditorBase.js'
import { plainText, type RichTextFormat } from './model.js'
import { parseRichText } from './html.js'
import { RichTextController } from './controller.js'
import type { RichTextFormatDetail } from '../rich-text-toolbar/index.js'
import { PopupController } from '../../core/popup.js'

export class RichTextEditor extends RichTextEditorBase {
    stylesheet = componentStylesheet
    private readonly active = state<readonly RichTextFormat[]>([])
    private controller?: RichTextController
    private toolbarPopup?: PopupController
    private get editor(): HTMLElement | undefined { const node = this.refs.editor?.[0]; return node instanceof HTMLElement ? node : undefined }
    protected fieldElement(): HTMLTextAreaElement | undefined { const node = this.refs.control?.[0]; return node instanceof HTMLTextAreaElement ? node : undefined }
    private blocked = or(this.controlUnavailable, this.props.readOnly)
    render(): Template {
        return html`<div part="shell" data-variant=${() => this.inlineMode() ? 'inline' : 'box'}
            data-invalid=${() => this.validationMessage && (this.validationShown || scalarText(this.errorText)) ? '' : null}>
            <cb-rich-text-toolbar part="toolbar" ref="toolbar" hidden accessible-label=${this.props.toolbarLabel}
                exportparts="toolbar-control,format,format-bold,format-italic,format-underline,format-strikethrough,format-superscript,format-subscript,format-control,format-label,format-icon"
                active-formats=${this.active[0]} disabled=${this.blocked}
                bold-label=${this.props.boldLabel} italic-label=${this.props.italicLabel} underline-label=${this.props.underlineLabel}
                strikethrough-label=${this.props.strikethroughLabel} superscript-label=${this.props.superscriptLabel} subscript-label=${this.props.subscriptLabel}
                onformat=${(event: CustomEvent<RichTextFormatDetail>) => { event.stopPropagation(); this.controller?.format(event.detail.format, event.detail.originalEvent) }}></cb-rich-text-toolbar>
            <div ref="editor" part="control" role="textbox" tabindex=${() => this.unavailable ? -1 : 0}
                contenteditable=${() => this.blocked() ? 'false' : 'true'} spellcheck="true"
                aria-label=${this.accessibleName} aria-multiline=${() => !this.inlineMode()}
                aria-readonly=${this.props.readOnly} aria-disabled=${this.controlUnavailable} aria-required=${this.props.required}
                aria-invalid=${() => this.validationMessage && (this.validationShown || scalarText(this.errorText)) ? 'true' : null}
                aria-description=${this.props.description} aria-placeholder=${this.props.placeholder} data-placeholder=${this.props.placeholder}></div>
            <textarea ref="control" hidden aria-hidden="true" tabindex="-1" required=${this.props.required}
                readonly=${this.props.readOnly} disabled=${this.controlUnavailable}></textarea>
        </div>`
    }

    focus(options?: FocusOptions): void { this.controller?.focus(options) }
    protected syncForm(value: string | File | FormData | null): void {
        super.syncForm(value)
        const control = this.fieldElement(), editor = this.editor
        if (!control || !editor) return
        const flags: ValidityStateFlags = {}
        if (!this.unavailable && !bool(this.readOnly)) {
            if (control.validity.valueMissing) flags.valueMissing = true
            if (control.validity.customError) flags.customError = true
        }
        this.internals?.setValidity(flags, Object.keys(flags).length ? control.validationMessage : '', editor)
    }

    protected syncView(): void {
        this.normalizeSource()
        const editor = this.editor, control = this.fieldElement()
        if (!editor || !control) return
        if (!this.controller) this.controller = new RichTextController(editor, {
            value: () => this.value, commit: (value, event) => this.setValue(value, event),
            blocked: () => !this.canChangeValue(), inline: this.inlineMode,
            formatsChanged: this.active[1], submit: () => this.form?.requestSubmit(),
        })
        this.controller.sync()
        const text = plainText(parseRichText(this.value, this.ownerDocument, this.inlineMode()))
        control.value = text
        editor.toggleAttribute('data-empty', !text)
    }
    protected mount(): void {
        super.mount()
        const toolbar = this.refs.toolbar?.[0]
        if (toolbar instanceof HTMLElement && this.editor) {
            this.toolbarPopup = new PopupController(toolbar, this.editor, () => this.toolbarPopup?.hide(), { placement: () => 'top-start' })
            this.listen(this, 'focusin', this.syncToolbar)
            this.listen(this, 'focusout', () => queueMicrotask(this.syncToolbar))
            this.listen(this.ownerDocument, 'input', this.syncToolbar)
            this.listen(this.ownerDocument, 'change', this.syncToolbar)
            this.cleanup(() => { this.toolbarPopup?.dispose(); this.toolbarPopup = undefined; this.controller?.dispose(false); this.controller = undefined })
        }
    }
    private syncToolbar = (): void => {
        const toolbar = this.refs.toolbar?.[0]
        if (this.isConnected && (this.matches(':focus-within') || toolbar instanceof HTMLElement && toolbar.matches(':focus-within'))) this.toolbarPopup?.show()
        else this.toolbarPopup?.hide()
    }
}
export { RichTextEditorBase, RichTextController }
export type { RichTextControllerOptions } from './controller.js'
export type { RichTextEditorProps, RichTextEditorVariant } from './RichTextEditorBase.js'
export type { RichTextFormat } from './model.js'
register('cb-rich-text-editor', RichTextEditor)
