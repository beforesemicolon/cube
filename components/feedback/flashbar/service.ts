import './index.js'
import type { Flashbar } from './index.js'
import type { FlashbarMessage } from './FlashbarBase.js'

function host(): Flashbar {
    const existing = document.querySelector<Flashbar>('cb-flashbar[data-cb-global]')
    if (existing) return existing
    const flashbar = document.createElement('cb-flashbar') as Flashbar
    flashbar.dataset.cbGlobal = ''
    document.body.append(flashbar)
    return flashbar
}

export const showFlashbar = (message: FlashbarMessage): string => host().show(message)
export const updateFlashbar = (id: string, message: Partial<FlashbarMessage>): boolean => host().updateMessage(id, message)
export const hideFlashbar = (id: string): boolean => host().dismiss(id)
export const clearFlashbars = (): void => host().clear()
