import { UIComponent, type UIProps } from '../../core/UIComponent.js'
import { bool, scalarText } from '../../core/value.js'

export interface FieldProps extends UIProps {
    helpText?: string
    details?: string
    detailsLabel?: string
    errorText?: string
    required?: boolean
    optionalLabel?: string
    invalid?: boolean
}

/** Shared field anatomy for controls that need label, help, details and validation copy. */
export abstract class FieldBase<P extends FieldProps = FieldProps> extends UIComponent<P> {
    static observedAttributes = [
        ...UIComponent.observedAttributes, 'help-text', 'details', 'details-label', 'error-text', 'required', 'optional-label', 'invalid',
    ]
    helpText = ''
    details = ''
    detailsLabel = ''
    errorText = ''
    required = false
    optionalLabel = ''
    invalid = false

    protected fieldLabel(): string { return scalarText(this.label) }
    protected fieldHelp(): string { return scalarText(this.helpText) }
    protected fieldDetails(): string { return scalarText(this.details) }
    protected fieldError(): string { return scalarText(this.errorText) }
    protected isInvalid(): boolean { return bool(this.invalid) || Boolean(this.fieldError()) }
}
