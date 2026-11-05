import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { or, isNot, is, html, type Template } from '../../core/runtime.js'

import type { CodeEditor } from '../code-editor/index.js'
import { scalarText } from '../../core/value.js'
import { JsonEditorBase } from './JsonEditorBase.js'

export class JsonEditor extends JsonEditorBase {
    stylesheet = componentStylesheet
    private get editor(): CodeEditor | undefined {
        const node = this.refs.editor?.[0]
        return node?.localName === 'cb-code-editor' ? node as CodeEditor : undefined
    }
    render(): Template {
        const error = () => {
            const parsed = this.parse()
            return scalarText(this.props.errorText?.()) || parsed.error
        }
        const status = () => {
            const invalid = scalarText(this.invalidLabel), message = error()
            return message ? message === invalid ? invalid.replaceAll('{error}', '').trim() : invalid ? invalid.replaceAll('{error}', message) : message : scalarText(this.validLabel)
        }
        return html`<div part="root"><div part="toolbar">
            <span part="status" role="status" data-invalid="${() => error() ? '' : null}">${status}</span>
            <cb-button part="format" exportparts="control:format-control,label:format-label,button-label:format-label,icon:format-icon,description:format-description" variant="ghost" label="${this.props.formatLabel}" accessible-label="${this.props.formatLabel}"
                disabled="${or(() => this.unavailable, this.props.readOnly, isNot(this.sourceText), is(error))}"
                onaction="${(event: Event) => { event.stopPropagation(); this.format(event) }}"></cb-button>
        </div>
        <cb-code-editor ref="editor" part="editor" language="json" label="${this.props.label}"
            accessible-label="${this.props.accessibleLabel}" description="${this.props.description}"
            value="${this.sourceText}" placeholder="${this.props.placeholder}" line-numbers="${this.props.lineNumbers}"
            wrap="${this.props.wrap}" tab-size="${() => Math.max(1, this.normalizedIndent())}" position-label="${this.props.positionLabel}"
            disabled="${() => this.unavailable}" read-only="${this.props.readOnly}" required="${this.props.required}" error-text="${error}"
            onbeforechange="${(event: Event) => event.stopPropagation()}"
            onchange="${(event: CustomEvent<{ value: string }>) => {
                event.stopPropagation()
                if (!this.setValue(event.detail.value, event) && this.editor) this.editor.value = this.sourceText()
            }}"></cb-code-editor>
        </div>`
    }
    protected nestedEditor(): HTMLElement | undefined { return this.editor }
    protected syncView(): void { this.syncJsonForm() }
    focus(options?: FocusOptions): void { this.editor?.focus(options) }
}
export { JsonEditorBase }
export type { JsonEditorProps, JsonPrimitive, JsonValue, JsonValidator } from './JsonEditorBase.js'

register('cb-json-editor', JsonEditor)
