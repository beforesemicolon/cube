import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export interface EditorRect { x: number; y: number; width: number; height: number }
export type SelectionHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
export interface SelectionOverlayProps extends ComponentProps {
    rect?: EditorRect
    rotation?: number
    movable?: boolean
    resizable?: boolean
    rotatable?: boolean
    moveStep?: number
    minWidth?: number
    minHeight?: number
    showSize?: boolean
    moveLabel?: string
    resizeLabel?: string
    rotateLabel?: string
    sizeLabel?: string
    handleLabels?: Partial<Record<SelectionHandle, string>>
}

const handles: readonly SelectionHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
function normalizedRect(rect: EditorRect | undefined): EditorRect {
    return {
        x: finite(rect?.x), y: finite(rect?.y), width: Math.max(0, finite(rect?.width)), height: Math.max(0, finite(rect?.height)),
    }
}

/** Controlled move, resize and rotation behavior for a selected editor object. */
export abstract class SelectionOverlayBase<P extends SelectionOverlayProps = SelectionOverlayProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes, 'rect', 'rotation', 'movable', 'resizable', 'rotatable', 'move-step', 'min-width',
        'min-height', 'show-size', 'move-label', 'resize-label', 'rotate-label', 'size-label', 'handle-labels',
    ]
    rect: EditorRect = { x: 0, y: 0, width: 120, height: 80 }
    rotation = 0
    movable = true
    resizable = true
    rotatable = false
    moveStep = 1
    minWidth = 1
    minHeight = 1
    showSize = true
    moveLabel = ''
    resizeLabel = ''
    rotateLabel = ''
    sizeLabel = ''
    handleLabels: Partial<Record<SelectionHandle, string>> = {}

    currentRect(): EditorRect { return normalizedRect(this.rect) }
    moveBy(dx: number, dy: number, originalEvent?: Event): boolean {
        if (!bool(this.movable) || this.unavailable) return false
        const current = this.currentRect()
        const rect = { ...current, x: current.x + finite(dx), y: current.y + finite(dy) }
        return this.commitRect(rect, 'move', originalEvent)
    }

    resizeBy(handle: SelectionHandle, dx: number, dy: number, originalEvent?: Event): boolean {
        if (!bool(this.resizable) || this.unavailable || !handles.includes(handle)) return false
        const current = this.currentRect()
        const minimumWidth = Math.max(0, finite(this.minWidth, 1))
        const minimumHeight = Math.max(0, finite(this.minHeight, 1))
        let { x, y, width, height } = current
        if (handle.includes('e')) width = Math.max(minimumWidth, width + finite(dx))
        if (handle.includes('s')) height = Math.max(minimumHeight, height + finite(dy))
        if (handle.includes('w')) { const next = Math.max(minimumWidth, width - finite(dx)); x += width - next; width = next }
        if (handle.includes('n')) { const next = Math.max(minimumHeight, height - finite(dy)); y += height - next; height = next }
        return this.commitRect({ x, y, width, height }, 'resize', originalEvent, handle)
    }

    setRotation(rotation: number, originalEvent?: Event): boolean {
        if (!bool(this.rotatable) || this.unavailable) return false
        const normalized = ((finite(rotation) % 360) + 360) % 360
        const detail = { rotation: normalized, originalEvent }
        if (!this.request('cb-before-rotation-change', detail)) return false
        this.rotation = normalized
        this.syncView()
        this.emit('cb-rotation-change', detail)
        return true
    }

    protected handleLabel(handle: SelectionHandle): string {
        return scalarText(this.resizeLabel).replaceAll('{handle}', scalarText(this.handleLabels[handle], handle))
    }
    protected allHandles(): readonly SelectionHandle[] { return handles }
    protected normalizedStep(multiplier = 1): number { return Math.max(.1, finite(this.moveStep, 1)) * multiplier }

    private commitRect(rect: EditorRect, reason: 'move' | 'resize', originalEvent?: Event, handle?: SelectionHandle): boolean {
        const next = { x: finite(rect.x), y: finite(rect.y), width: Math.max(0, finite(rect.width)), height: Math.max(0, finite(rect.height)) }
        const detail = { rect: next, reason, handle, originalEvent }
        if (!this.request('cb-before-rect-change', detail)) return false
        this.rect = next
        this.syncView()
        this.emit('cb-rect-change', detail)
        return true
    }
}
