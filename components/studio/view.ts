import type { Template } from '../core/runtime.js'

import { bool } from '../core/value.js'
import { studioTemplates } from './templates.js'
import type { StudioItem, StudioValue } from './types.js'

export interface StudioView {
    root: Template;
    control?: HTMLElement;
    update(): void;
}
export interface StudioViewSource extends HTMLElement {
    readonly componentName: string;
    readonly componentKind: import('./types.js').StudioKind;
    label: string;
    accessibleLabel: string;
    description: string;
    disabled: boolean;
    value?: StudioValue;
    items?: readonly StudioItem[];
    placeholder?: string;
    status?: string;
    actionLabel?: string;
    emptyLabel?: string;
    min?: number;
    max?: number;
    step?: number;
    progress?: number;
    checked?: boolean;
    open?: boolean;
    multiple?: boolean;
    required?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    errorText?: string;
    expanded?: boolean;
    emit(name: string, detail?: object): void;
    setControlValue?(value: StudioValue, originalEvent?: Event): boolean;
    setFiles?(files: readonly File[], originalEvent?: Event): boolean;
    controlUnavailable?(): boolean;
}

/** Markup owns the control DOM; this hook only reflects host-level presentation. */
export function createStudioView(source: StudioViewSource): StudioView {
    const root = studioTemplates(source)
    const update = (): void => {
        source.dataset.kind = source.componentKind
        const invalid = bool(source.invalid) || Boolean(source.errorText) || source.hasAttribute('data-field-invalid')
        source.toggleAttribute('data-invalid', invalid)

    }
    return { root, get control() { const control = root.refs.control?.[0]; return control instanceof HTMLElement ? control : undefined }, update }
}
export type { StudioItem, StudioValue }
