import { register } from '../../core/Component.js'
import componentStylesheet from '../../studio/view.css?inline'
import { html, is, isNot, or, type Template } from '../../core/runtime.js'
import { scalarText } from '../../core/value.js'
import { FilePickerBase } from './FilePickerBase.js';
export class FilePicker extends FilePickerBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<div part="root" data-component="file-picker">
            <div part="body">
                <cb-button
                    part="button"
                    label="${this.props.fileLabel}"
                    accessible-label="${() => scalarText(this.fileLabel) || this.accessibleName()}"
                    description="${this.props.fileRequirements}"
                    variant="${this.props.variant}"
                    size="${this.props.size}"
                    icon="${this.props.icon}"
                    disabled="${or(() => this.controlUnavailable(), this.props.readOnly)}"
                    loading="${this.props.loading}"
                    hidden="${isNot(this.props.presentation, 'button')}"
                    onaction="${this.handlePick}"
                ></cb-button>
                <label
                    part="dropzone"
                    hidden="${is(this.props.presentation, 'button')}"
                    ><cb-icon part="dropzone-icon icon" name="upload" aria-hidden="true"></cb-icon>
                    <strong part="dropzone-title">${this.props.fileLabel}</strong
                    ><span part="description">${this.props.fileRequirements}</span>
                    ><input
                        ref="control"
                        part="control file"
                        type="file"
                        hidden
                        accept="${this.props.accept}"
                        capture="${this.props.capture}"
                        disabled="${or(() => this.controlUnavailable(), this.props.readOnly)}"
                        required="${this.props.required}"
                        multiple="${this.props.multiple}"
                        aria-label="${this.accessibleName}"
                        onchange="${this.handleFileChange}"
                    />
                </label>
            </div>
        </div>`
    }
    protected syncView(): void {
        this.dataset.kind = this.componentKind
    }
    private handlePick = (event: Event): void => {
        event.stopPropagation()
        this.pickFiles()
    }
    private handleFileChange = (event: Event): void => {
        const input = event.currentTarget
        event.stopPropagation()
        if (!(input instanceof HTMLInputElement)) return
        this.setFiles([...(input.files ?? [])], event)
        input.value = ''
    }
}
export { FilePickerBase };
export type {
    FilePickerProps,
    FilePickerCapture,
    FilePickerPresentation,
} from './FilePickerBase.js';

register('cb-file-picker', FilePicker)
