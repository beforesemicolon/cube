import { InputBase, type InputProps } from '../InputBase.js'
import type { FormRestoreValue } from '../FormControlBase.js'
import type { StudioKind, StudioValue } from '../../studio/types.js'
import { bool } from '../../core/value.js'

export interface FilePickerProps extends InputProps {
    fileLabel?: string
    fileRequirements?: string
    required?: boolean
    multiple?: boolean
}

/** Headless behavior for the File picker component. */
export abstract class FilePickerBase extends InputBase<FilePickerProps> {
    static observedAttributes = [...InputBase.observedAttributes, 'file-label', 'file-requirements', 'required', 'multiple']
    fileLabel = ''
    fileRequirements = ''
    required = false
    multiple = false
    files: readonly File[] = []
    readonly componentName = 'file-picker'
    readonly componentKind: StudioKind = 'file'
    setFiles(files: readonly File[], originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const next = this.multiple ? [...files] : files.slice(0, 1)
        const value = this.multiple ? next.map(file => file.name) : next[0]?.name ?? ''
        const detail = { value, files: next, originalEvent }
        if (!this.request('beforechange', detail)) return false
        this.files = next
        this.value = value
        this.syncView()
        this.syncFormValue()
        this.emit('change', detail)
        return true
    }
    protected restoreValue(value: StudioValue | FormRestoreValue): void {
        const control = this.fieldElement()
        if (control instanceof HTMLInputElement && control.type === 'file') control.value = ''
        if (value instanceof File) {
            this.files = [value]
            this.value = value.name
            return
        }
        if (value instanceof FormData) {
            this.files = value.getAll(this.name).filter((item): item is File => item instanceof File)
            this.value = this.multiple ? this.files.map(file => file.name) : this.files[0]?.name ?? ''
            return
        }
        this.files = []
        super.restoreValue(value)
    }
    protected syncFormValue(): void {
        if (!this.files.length) { this.syncForm(null); return }
        if (!this.multiple) { this.syncForm(this.files[0] ?? null); return }
        const data = new FormData()
        if (this.name) for (const file of this.files) data.append(this.name, file)
        this.syncForm(data)
    }
}
