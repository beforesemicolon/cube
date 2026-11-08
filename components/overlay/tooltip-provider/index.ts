import { register } from '../../core/Component.js'
import { html, state, type Template } from '../../core/runtime.js'
import { finite } from '../../core/value.js'
import type { TooltipAnchor } from '../tooltip/index.js'
import { tooltipScrollBoundary } from '../tooltip/bounds.js'
import { TooltipProviderBase } from './TooltipProviderBase.js'
import componentStylesheet from './styles.css?inline'

interface ButtonTarget { control: HTMLElement; semantic: HTMLElement; path: readonly EventTarget[] }

function containsComposed(container: HTMLElement, node: EventTarget | null): boolean {
    let current: Node | null = node instanceof Node ? node : null
    while (current) {
        if (current === container) return true
        current = current instanceof ShadowRoot ? current.host : current instanceof HTMLElement && current.assignedSlot ? current.assignedSlot : current.parentNode
    }
    return false
}

export class TooltipProvider extends TooltipProviderBase {
    stylesheet = componentStylesheet
    private readonly content = state('')
    private readonly shortcut = state('')
    private readonly anchor = state<TooltipAnchor | null>(null)
    private readonly shown = state(false)
    private hover?: ButtonTarget
    private focused?: ButtonTarget
    private active?: ButtonTarget
    private timer?: ReturnType<typeof setTimeout>
    private frame?: number
    private titles: Array<{ element: HTMLElement; value: string }> = []
    private described?: { element: HTMLElement; previous: string | null; value: string }

    render(): Template {
        return html`<slot></slot>
            <cb-tooltip content=${this.content[0]} shortcut=${this.shortcut[0]} anchor-rect=${this.anchor[0]} open=${this.shown[0]}></cb-tooltip>`
    }

    protected mount(): void {
        super.mount()
        const listeners = new AbortController()
        const options = { capture: true, signal: listeners.signal }
        this.addEventListener('pointerover', this.pointerOver, options)
        // Unlike over/out, move is not trimmed when related targets retarget to
        // the same enclosing shadow host (for example, two workspace buttons).
        this.addEventListener('pointermove', this.pointerOver, options)
        this.addEventListener('pointerout', this.pointerOut, options)
        this.addEventListener('focusin', this.focusIn, options)
        this.addEventListener('focusout', this.focusOut, options)
        this.ownerDocument.addEventListener('keydown', this.keyDown, options)
        this.addEventListener('keyup', this.keyUp, options)
        this.ownerDocument.addEventListener('pointerdown', this.dismiss, options)
        this.ownerDocument.addEventListener('scroll', this.dismiss, options)
        this.ownerDocument.defaultView?.addEventListener('blur', this.dismiss, options)
        this.cleanup(() => listeners.abort())
    }
    protected update(): void {
        if (!this.tooltipsEnabled()) this.dismiss()
    }
    protected unmount(): void { this.dismiss() }

    private target = (event: Event): ButtonTarget | undefined => {
        if (!this.tooltipsEnabled()) return
        const path = event.composedPath().slice(0, event.composedPath().indexOf(this))
        if (path.some(node => node instanceof HTMLElement && (node.localName === 'cb-tooltip' || node.localName === 'cb-tooltip-provider'))) return
        const host = path.find(node => node instanceof HTMLElement && node.localName === 'cb-button')
        const native = path.find(node => node instanceof HTMLElement && node.matches('button, input[type=button], input[type=submit], input[type=reset], [role=button]'))
        const control = host instanceof HTMLElement ? host : native
        if (!(control instanceof HTMLElement)) return
        const semantic = control.hasAttribute('data-semantic-host') || !(native instanceof HTMLElement) ? control : native
        return { control, semantic, path }
    }
    private name = (target: ButtonTarget): string => {
        const control = target.control
        const labelledBy = control.ariaLabelledByElements?.map(element => element.textContent).join(' ').trim()
        // Explicit help may include shortcut hints while the accessible name
        // remains concise. Retain it while native title bubbles are suppressed.
        return (control.getAttribute('title') || this.titles.find(item => item.element === control)?.value || labelledBy || control.getAttribute('aria-label') ||
            ('accessibleLabel' in control && typeof control.accessibleLabel === 'string' ? control.accessibleLabel : '') ||
            control.getAttribute('accessible-label') ||
            ('label' in control && typeof control.label === 'string' ? control.label : '') ||
            control.getAttribute('label') || target.semantic.getAttribute('aria-label') ||
            (control instanceof HTMLInputElement ? control.value : control.textContent) || '').trim()
    }
    private updateHint = (target: ButtonTarget): void => {
        const keys = target.control.getAttribute('data-shortcut') || target.control.getAttribute('aria-keyshortcuts') || ''
        const name = this.name(target), suffix = ` (${keys})`
        this.shortcut[1](keys)
        this.content[1](keys && name.endsWith(suffix) ? name.slice(0, -suffix.length) : name)
    }
    private pointerOver = (event: PointerEvent): void => {
        if (event.pointerType === 'touch') return
        this.hover = this.target(event)
        this.schedule()
    }
    private pointerOut = (event: PointerEvent): void => {
        if (this.hover && containsComposed(this.hover.control, event.relatedTarget)) return
        this.hover = undefined
        this.schedule()
    }
    private focusIn = (event: FocusEvent): void => { this.focused = this.target(event); this.schedule() }
    private focusOut = (event: FocusEvent): void => {
        if (this.focused && containsComposed(this.focused.control, event.relatedTarget)) return
        const leaving = this.target(event)
        if (leaving?.control === this.active?.control) { this.dismiss(); return }
        this.focused = undefined
        this.schedule()
    }
    private keyDown = (event: KeyboardEvent): void => { if (event.key === 'Escape') this.dismiss() }
    private keyUp = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') return
        this.hover = undefined
        this.focused = this.target(event)
        this.schedule()
    }

    private schedule = (): void => {
        const next = this.hover ?? this.focused
        if (next?.control === this.active?.control) return
        this.close()
        if (!next || !this.name(next)) return
        this.active = next
        // Suppress browser title bubbles only while this provider owns the hint.
        for (const node of next.path) {
            if (!(node instanceof HTMLElement) || !node.hasAttribute('title')) continue
            this.titles.push({ element: node, value: node.getAttribute('title') ?? '' })
            node.setAttribute('title', '')
        }
        this.updateHint(next)
        this.timer = setTimeout(() => {
            this.timer = undefined
            this.track()
            if (this.active?.control !== next.control) return
            this.shown[1](true)
            const previous = next.semantic.getAttribute('aria-description')
            const hint = `${this.content[0]()}${this.shortcut[0]() ? ` (${this.shortcut[0]()})` : ''}`
            const value = [previous, hint].filter(Boolean).join(' ')
            this.described = { element: next.semantic, previous, value }
            next.semantic.setAttribute('aria-description', value)
        }, Math.max(0, finite(this.delay, 400)))
    }
    private track = (): void => {
        const active = this.active, view = this.ownerDocument.defaultView
        if (!active || !view) return
        // Composed focus/pointer events can be trimmed at shadow boundaries;
        // scrolling, iframe entry and inert/removed controls can also end hover
        // without an over/out event reaching this provider.
        if (this.hover && !this.hover.control.matches(':hover')) this.hover = undefined
        if (this.focused && !this.focused.control.matches(':focus-within')) this.focused = undefined
        if ((this.hover ?? this.focused)?.control !== active.control) { this.schedule(); return }
        const rect = active.control.getBoundingClientRect()
        const boundary = tooltipScrollBoundary(active.control)
        if (!active.control.isConnected || !rect.width || !rect.height || rect.right <= boundary.left || rect.bottom <= boundary.top || rect.left >= boundary.right || rect.top >= boundary.bottom) {
            this.dismiss()
            return
        }
        this.updateHint(active)
        const previous = this.anchor[0]()
        if (!previous || previous.left !== rect.left || previous.right !== rect.right || previous.top !== rect.top || previous.bottom !== rect.bottom)
            this.anchor[1]({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom })
        // Scrollports determine whether the trigger is visible, not the space
        // available to its top-layer tooltip. Small toolbars must not clip text.
        this.frame = view.requestAnimationFrame(this.track)
    }
    private close = (): void => {
        if (this.timer !== undefined) clearTimeout(this.timer)
        this.timer = undefined
        if (this.frame !== undefined) this.ownerDocument.defaultView?.cancelAnimationFrame(this.frame)
        this.frame = undefined
        this.shown[1](false)
        this.anchor[1](null)
        if (this.described && this.described.element.getAttribute('aria-description') === this.described.value) {
            if (this.described.previous === null) this.described.element.removeAttribute('aria-description')
            else this.described.element.setAttribute('aria-description', this.described.previous)
        }
        this.described = undefined
        for (const { element, value } of this.titles) if (element.getAttribute('title') === '') element.setAttribute('title', value)
        this.titles = []
        this.active = undefined
    }
    private dismiss = (): void => { this.hover = undefined; this.focused = undefined; this.close() }
}

export { TooltipProviderBase }
export type { TooltipProviderProps } from './TooltipProviderBase.js'
register('cb-tooltip-provider', TooltipProvider)
