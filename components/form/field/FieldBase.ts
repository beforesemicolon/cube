import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export interface FieldProps extends ComponentProps {
    helpText?: string
    details?: string
    detailsLabel?: string
    errorText?: string
    successText?: string
    required?: boolean
    optionalLabel?: string
    invalid?: boolean
    success?: boolean
}

/** Shared field anatomy for controls that need label, help, details and validation copy. */
export abstract class FieldBase<P extends FieldProps = FieldProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes, 'help-text', 'details', 'details-label', 'error-text', 'success-text', 'required', 'optional-label', 'invalid', 'success',
    ]
    helpText = ''
    details = ''
    detailsLabel = ''
    errorText = ''
    successText = ''
    required = false
    optionalLabel = ''
    invalid = false
    success = false

    protected fieldLabel = (): string => { return scalarText(this.label) }
    protected fieldHelp = (): string => { return scalarText(this.helpText) }
    protected fieldDetails = (): string => { return scalarText(this.details) }
    protected fieldError = (): string => { return scalarText(this.errorText) }
    protected fieldSuccess = (): string => { return scalarText(this.successText) }
    protected isInvalid = (): boolean => { return bool(this.invalid) || Boolean(this.fieldError()) }
    protected isSuccess(): boolean { return !this.isInvalid() && (bool(this.success) || Boolean(this.fieldSuccess())) }
}
