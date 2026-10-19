import type { Flashbar } from './index.js'
import type { FlashbarMessage } from './FlashbarBase.js'

export interface FlashbarHostOptions {
    parent?: HTMLElement
    accessibleLabel?: string
    position?: Flashbar['position']
    maxVisible?: number
}

export interface FlashbarHandle {
    readonly id: string
    update(message: Partial<FlashbarMessage>): boolean
    dismiss(): boolean
}

let options: FlashbarHostOptions = {}

export function configureFlashbarHost(next: FlashbarHostOptions): void {
    options = { ...options, ...next }
    const existing = document.querySelector<Flashbar>('cb-flashbar[data-cb-global]')
    if (existing) applyOptions(existing)
}

function applyOptions(flashbar: Flashbar): void {
    if (options.accessibleLabel !== undefined) flashbar.accessibleLabel = options.accessibleLabel
    if (options.position !== undefined) flashbar.position = options.position
    if (options.maxVisible !== undefined) flashbar.maxVisible = options.maxVisible
}

export function getFlashbarHost(): Flashbar {
    const parent = options.parent ?? document.body
    const existing = parent.querySelector<Flashbar>(':scope > cb-flashbar[data-cb-global]')
    if (existing) return existing
    const flashbar = document.createElement('cb-flashbar') as Flashbar
    flashbar.dataset.cbGlobal = ''
    applyOptions(flashbar)
    parent.append(flashbar)
    return flashbar
}

export const showFlashbar = (message: FlashbarMessage): string => getFlashbarHost().show(message)
export function createFlashbar(message: FlashbarMessage): FlashbarHandle {
    const id = showFlashbar(message)
    return {
        id,
        update: next => updateFlashbar(id, next),
        dismiss: () => hideFlashbar(id),
    }
}
export const updateFlashbar = (id: string, message: Partial<FlashbarMessage>): boolean => getFlashbarHost().updateMessage(id, message)
export const hideFlashbar = (id: string): boolean => getFlashbarHost().dismiss(id)
export const clearFlashbars = (): void => getFlashbarHost().clear()
