import { state } from '../../core/runtime.js'
import { Component, type ComponentProps } from '../../core/Component.js'
import { bool, clamp, finite, scalarText } from '../../core/value.js'

export type WorkspacePanel = 'start' | 'end' | 'bottom'
export interface WorkspaceProps extends ComponentProps {
    startOpen?: boolean
    endOpen?: boolean
    bottomOpen?: boolean
    startSize?: number
    endSize?: number
    bottomSize?: number
    minStartSize?: number
    maxStartSize?: number
    minEndSize?: number
    maxEndSize?: number
    minBottomSize?: number
    maxBottomSize?: number
    resizeStep?: number
    mobileBreakpoint?: number
    mobilePanel?: '' | WorkspacePanel
    persistKey?: string
    startLabel?: string
    endLabel?: string
    bottomLabel?: string
    openStartLabel?: string
    closeStartLabel?: string
    openEndLabel?: string
    closeEndLabel?: string
    openBottomLabel?: string
    closeBottomLabel?: string
    closeMobileLabel?: string
}

interface PersistedWorkspaceState {
    startOpen: boolean
    endOpen: boolean
    bottomOpen: boolean
    startSize: number
    endSize: number
    bottomSize: number
}

/** Coordinated panel state, resizing and responsive behavior for application workspaces. */
export abstract class WorkspaceBase<P extends WorkspaceProps = WorkspaceProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes, 'start-open', 'end-open', 'bottom-open', 'start-size', 'end-size', 'bottom-size',
        'min-start-size', 'max-start-size', 'min-end-size', 'max-end-size', 'min-bottom-size', 'max-bottom-size',
        'resize-step', 'mobile-breakpoint', 'mobile-panel', 'persist-key', 'start-label', 'end-label', 'bottom-label',
        'open-start-label', 'close-start-label', 'open-end-label', 'close-end-label', 'open-bottom-label',
        'close-bottom-label', 'close-mobile-label',
    ]
    startOpen = true
    endOpen = true
    bottomOpen = false
    startSize = 280
    endSize = 360
    bottomSize = 240
    minStartSize = 180
    maxStartSize = 560
    minEndSize = 220
    maxEndSize = 720
    minBottomSize = 140
    maxBottomSize = 640
    resizeStep = 16
    mobileBreakpoint = 860
    mobilePanel: '' | WorkspacePanel = ''
    persistKey = ''
    startLabel = ''
    endLabel = ''
    bottomLabel = ''
    openStartLabel = ''
    closeStartLabel = ''
    openEndLabel = ''
    closeEndLabel = ''
    openBottomLabel = ''
    closeBottomLabel = ''
    closeMobileLabel = ''
    private readonly mobileState = state(false)
    protected get mobile(): boolean { return this.mobileState[0]() }
    protected set mobile(value: boolean) { this.mobileState[1](value) }
    private observer?: ResizeObserver
    private restored = false

    protected mount(): void {
        this.restore()
        super.mount()
        if (typeof ResizeObserver !== 'undefined') {
            this.observer = new ResizeObserver(() => this.syncResponsive())
            this.observer.observe(this)
            this.cleanup(() => this.observer?.disconnect())
        }
        this.syncResponsive()
    }

    isPanelOpen(panel: WorkspacePanel): boolean {
        return bool(panel === 'start' ? this.startOpen : panel === 'end' ? this.endOpen : this.bottomOpen)
    }

    panelSize(panel: WorkspacePanel): number {
        if (panel === 'start') return clamp(finite(this.startSize, 280), finite(this.minStartSize, 180), finite(this.maxStartSize, 560))
        if (panel === 'end') return clamp(finite(this.endSize, 360), finite(this.minEndSize, 220), finite(this.maxEndSize, 720))
        return clamp(finite(this.bottomSize, 240), finite(this.minBottomSize, 140), finite(this.maxBottomSize, 640))
    }

    togglePanel(panel: WorkspacePanel, open = !this.isPanelOpen(panel), originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const detail = { panel, open, originalEvent }
        if (!this.request('beforepaneltoggle', detail)) return false
        if (this.mobile) {
            this.mobilePanel = open ? panel : ''
            this.setAttribute('mobile-panel', this.mobilePanel)
        } else this.setPanelOpen(panel, open)
        this.persist()
        this.syncView()
        this.emit('paneltoggle', detail)
        this.emitLayout()
        return true
    }

    resizePanel(panel: WorkspacePanel, size: number, originalEvent?: Event): boolean {
        if (this.unavailable) return false
        const next = this.clampedSize(panel, size)
        if (next === this.panelSize(panel)) return false
        const detail = { panel, size: next, originalEvent }
        if (!this.request('beforepanelresize', detail)) return false
        if (panel === 'start') this.startSize = next
        else if (panel === 'end') this.endSize = next
        else this.bottomSize = next
        this.persist()
        this.syncView()
        this.emit('panelresize', detail)
        this.emitLayout()
        return true
    }

    protected panelLabel(panel: WorkspacePanel): string {
        return scalarText(panel === 'start' ? this.startLabel : panel === 'end' ? this.endLabel : this.bottomLabel)
    }

    protected panelToggleLabel(panel: WorkspacePanel, open: boolean): string {
        if (panel === 'start') return scalarText(open ? this.closeStartLabel : this.openStartLabel)
        if (panel === 'end') return scalarText(open ? this.closeEndLabel : this.openEndLabel)
        return scalarText(open ? this.closeBottomLabel : this.openBottomLabel)
    }

    private setPanelOpen(panel: WorkspacePanel, open: boolean): void {
        if (panel === 'start') this.startOpen = open
        else if (panel === 'end') this.endOpen = open
        else this.bottomOpen = open
        this.toggleAttribute(`data-${panel}-open`, open)
    }

    private clampedSize(panel: WorkspacePanel, size: number): number {
        if (panel === 'start') return clamp(size, finite(this.minStartSize, 180), finite(this.maxStartSize, 560))
        if (panel === 'end') return clamp(size, finite(this.minEndSize, 220), finite(this.maxEndSize, 720))
        return clamp(size, finite(this.minBottomSize, 140), finite(this.maxBottomSize, 640))
    }

    private syncResponsive(): void {
        const next = this.getBoundingClientRect().width <= Math.max(320, finite(this.mobileBreakpoint, 860))
        if (next === this.mobile) return
        this.mobile = next
        if (!next) this.mobilePanel = ''
        this.toggleAttribute('data-mobile', next)
        this.syncView()
        this.emitLayout()
    }

    private emitLayout(): void {
        this.emit('layoutchange', {
            mobile: this.mobile, mobilePanel: this.mobilePanel, startOpen: this.isPanelOpen('start'), endOpen: this.isPanelOpen('end'),
            bottomOpen: this.isPanelOpen('bottom'), startSize: this.panelSize('start'), endSize: this.panelSize('end'), bottomSize: this.panelSize('bottom'),
        })
    }

    private persist(): void {
        const key = scalarText(this.persistKey).trim()
        if (!key || typeof localStorage === 'undefined') return
        const state: PersistedWorkspaceState = {
            startOpen: this.isPanelOpen('start'), endOpen: this.isPanelOpen('end'), bottomOpen: this.isPanelOpen('bottom'),
            startSize: this.panelSize('start'), endSize: this.panelSize('end'), bottomSize: this.panelSize('bottom'),
        }
        try { localStorage.setItem(key, [Number(state.startOpen), Number(state.endOpen), Number(state.bottomOpen), state.startSize, state.endSize, state.bottomSize].join(':')) } catch { /* Storage is optional. */ }
    }

    private restore(): void {
        if (this.restored) return
        this.restored = true
        const key = scalarText(this.persistKey).trim()
        if (!key || typeof localStorage === 'undefined') return
        let value = ''
        try { value = localStorage.getItem(key) ?? '' } catch { return }
        const parts = value.split(':').map(Number)
        if (parts.length !== 6 || parts.some(part => !Number.isFinite(part))) return
        this.startOpen = parts[0] === 1
        this.endOpen = parts[1] === 1
        this.bottomOpen = parts[2] === 1
        this.startSize = this.clampedSize('start', parts[3] ?? this.startSize)
        this.endSize = this.clampedSize('end', parts[4] ?? this.endSize)
        this.bottomSize = this.clampedSize('bottom', parts[5] ?? this.bottomSize)
    }
}
