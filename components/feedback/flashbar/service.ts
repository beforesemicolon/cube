import type { Flashbar } from './index.js'
import type { FlashbarMessage } from './FlashbarBase.js'

export interface FlashbarHostOptions {
    parent?: HTMLElement
    renderer?: Flashbar
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
let renderer: Flashbar | undefined

export function configureFlashbarHost(next: FlashbarHostOptions): void {
    options = { ...options, ...next }
    if (next.renderer) renderer = next.renderer
    const parent = options.parent ?? document.body
    if (renderer && next.parent && renderer.parentElement !== parent) {
        parent.append(renderer)
    }
    if (renderer) applyOptions(renderer)
}

function applyOptions(flashbar: Flashbar): void {
    if (options.accessibleLabel !== undefined)
        flashbar.accessibleLabel = options.accessibleLabel
    if (options.position !== undefined) flashbar.position = options.position
    if (options.maxVisible !== undefined)
        flashbar.maxVisible = options.maxVisible
}

export function getFlashbarHost(): Flashbar {
    const parent = options.parent ?? document.body
    const configured = options.renderer?.isConnected
        ? options.renderer
        : renderer?.isConnected
          ? renderer
          : undefined
    if (configured?.isConnected) {
        applyOptions(configured)
        return configured
    }
    const existing = parent.querySelector<Flashbar>(
        ':scope > cb-flashbar[data-cb-global]'
    )
    if (existing) {
        renderer = existing
        applyOptions(existing)
        return existing
    }
    const flashbar = document.createElement('cb-flashbar') as Flashbar
    flashbar.dataset.cbGlobal = ''
    applyOptions(flashbar)
    parent.append(flashbar)
    renderer = flashbar
    return flashbar
}

export const showFlashbar = (message: FlashbarMessage): string =>
    getFlashbarHost().show(message)
export function createFlashbar(message: FlashbarMessage): FlashbarHandle {
    const id = showFlashbar(message)
    return {
        id,
        update: (next) => updateFlashbar(id, next),
        dismiss: () => hideFlashbar(id),
    }
}
export const updateFlashbar = (
    id: string,
    message: Partial<FlashbarMessage>
): boolean => getFlashbarHost().updateMessage(id, message)
export const hideFlashbar = (id: string): boolean =>
    getFlashbarHost().dismiss(id)
export const clearFlashbars = (): void => getFlashbarHost().clear()
