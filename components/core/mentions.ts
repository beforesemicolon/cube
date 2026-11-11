import { PopupController } from './popup.js'

/** A mention's identity is separate from its serialized text. No application expressions are executed here. */
export interface MentionOption {
    id: string
    label: string
    insertText: string
    group?: string
    description?: string
    keywords?: readonly string[]
    disabled?: boolean
}
export interface MentionSelection { start: number; end: number }
export interface MentionMatch extends MentionSelection { query: string }
export interface MentionSelectDetail { option: MentionOption; range: MentionMatch; originalEvent: Event }
export interface MentionConfiguration {
    options: readonly MentionOption[]
    trigger?: string
    label?: string
    onSelect?: (detail: MentionSelectDetail) => void
}
/** Custom editors implement this small contract; replacement must join their own editing history. */
export interface MentionAdapter {
    element: HTMLElement
    text: () => string
    selection: () => MentionSelection | null
    replace: (range: MentionSelection, text: string, event: Event) => boolean
    caretRect: () => DOMRect
    blocked?: () => boolean
}
export function detectMention(text: string, selection: MentionSelection | null, trigger = '@'): MentionMatch | null {
    if (!trigger || !selection || selection.start !== selection.end) return null
    const before = text.slice(0, selection.start), start = before.lastIndexOf(trigger)
    if (start < 0 || start > 0 && /[\w@]/u.test(before[start - 1])) return null
    const query = before.slice(start + trigger.length)
    return /[\s{}@]/u.test(query) ? null : { start, end: selection.end, query }
}
export function filterMentions(options: readonly MentionOption[], query: string): MentionOption[] {
    const term = query.toLocaleLowerCase()
    return options.filter(option => !option.disabled && [option.label, option.id, option.group || '', ...(option.keywords || [])].some(value => value.toLocaleLowerCase().includes(term)))
}
/** Keep portalled suggestions inside their containing modal/popover's interaction scope. */
function suggestionContainer(anchor: HTMLElement): HTMLElement {
    let node: Node | null = anchor
    while (node) {
        if (node.nodeType === 1 && (node as HTMLElement).matches(':popover-open,dialog:modal')) return node as HTMLElement
        node = node.nodeType === 1 && (node as Element).assignedSlot || node.parentNode || (node.nodeType === 11 && 'host' in node ? (node as ShadowRoot).host : null)
    }
    return anchor.ownerDocument.body
}
let sequence = 0
/** Headless trigger/selection controller. Omit view to use Cube's default accessible suggestion list. */
export class MentionController {
    private readonly abort: AbortController
    private match: MentionMatch | null = null
    private choices: MentionOption[] = []
    private active = 0
    private composing = false
    private popup?: HTMLElement
    private popupController?: PopupController
    private suppressed = ''
    private readonly original: Map<string, string | null>
    constructor(private readonly adapter: MentionAdapter, private readonly config: () => MentionConfiguration | null | undefined,
        private readonly view?: (options: readonly MentionOption[], active: number, rect: DOMRect, choose: (index: number, event: Event) => void) => void) {
        const document = adapter.element.ownerDocument
        const Abort = document.defaultView?.AbortController ?? AbortController
        this.abort = new Abort()
        this.original = new Map(['aria-controls', 'aria-expanded', 'aria-activedescendant', 'aria-autocomplete'].map(name => [name, adapter.element.getAttribute(name)]))
        const signal = this.abort.signal
        adapter.element.addEventListener('keydown', this.keydown, { capture: true, signal })
        for (const type of ['input', 'beforeinput', 'keyup', 'click', 'focus']) adapter.element.addEventListener(type, () => queueMicrotask(this.refresh), { signal })
        adapter.element.addEventListener('compositionstart', () => { this.composing = true; this.close() }, { signal })
        adapter.element.addEventListener('compositionend', () => { this.composing = false; this.refresh() }, { signal })
        adapter.element.addEventListener('blur', this.close, { signal })
        document.addEventListener('selectionchange', this.refresh, { signal })
        document.addEventListener('scroll', this.close, { capture: true, signal })
        document.defaultView?.addEventListener('resize', this.close, { signal })
    }
    get isOpen(): boolean { return !!this.match }
    refresh = (): void => {
        const config = this.config(), element = this.adapter.element
        if (!config || this.composing || this.adapter.blocked?.() || !element.matches(':focus')) { this.close(); return }
        const match = detectMention(this.adapter.text(), this.adapter.selection(), config.trigger)
        const signature = JSON.stringify(match)
        if (!match || signature === this.suppressed) { this.close(); return }
        const choices = filterMentions(config.options, match.query)
        if (!choices.length) { this.close(); return }
        if (this.match?.query !== match.query) this.active = 0
        this.match = match; this.choices = choices; this.active = Math.min(this.active, choices.length - 1)
        this.render()
    }
    private render = (): void => {
        if (!this.match) return
        const rect = this.adapter.caretRect()
        if (this.view) { this.view(this.choices, this.active, rect, this.choose); return }
        const element = this.adapter.element, document = element.ownerDocument
        if (!this.popup) {
            this.popup = document.createElement('div'); this.popup.id = `cb-mentions-${++sequence}`
            this.popup.setAttribute('role', 'listbox'); this.popup.setAttribute('data-cb-mentions', '')
            this.popup.style.cssText = 'position:fixed;z-index:var(--z-index-popup,100);width:max-content;box-sizing:border-box;min-width:220px;max-width:calc(100vw - 16px);max-height:240px;overflow:auto;padding:4px;border:1px solid var(--color-separator,#81929c);border-radius:var(--radius-md,8px);background:var(--color-surface-raised,var(--color-surface,#fff));color:var(--color-foreground,#20282c);font:14px/1.4 system-ui;text-align:start'
            const theme = document.defaultView!.getComputedStyle(element)
            for (const name of ['--color-separator', '--radius-md', '--color-surface-raised', '--color-surface', '--color-foreground', '--color-selection', '--color-selection-foreground', '--z-index-popup']) { const value = theme.getPropertyValue(name); if (value) this.popup.style.setProperty(name, value) }
            suggestionContainer(element).append(this.popup)
            this.popupController = new PopupController(this.popup, element, this.close, { anchorBounds: this.adapter.caretRect, maxHeight: () => 240 })
        }
        this.popup.setAttribute('aria-label', this.config()?.label || 'Suggestions')
        this.popup.replaceChildren(...this.choices.map((option, index) => {
            const row = document.createElement('div'); row.id = `${this.popup!.id}-${index}`
            row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(index === this.active))
            row.style.cssText = `padding:7px 10px;border-radius:4px;cursor:pointer;${index === this.active ? 'background:var(--color-selection,#dceafa);color:var(--color-selection-foreground,var(--color-foreground,#142e4d))' : ''}`
            const label = document.createElement('div'); label.textContent = option.label; row.append(label)
            if (option.group || option.description) { const description = document.createElement('small'); description.textContent = [option.group, option.description].filter(Boolean).join(' · '); row.append(description) }
            row.addEventListener('pointerdown', event => { event.preventDefault(); this.choose(index, event) })
            return row
        }))
        this.popupController?.show()
        element.setAttribute('aria-autocomplete', 'list'); element.setAttribute('aria-controls', this.popup.id)
        element.setAttribute('aria-expanded', 'true'); element.setAttribute('aria-activedescendant', `${this.popup.id}-${this.active}`)
        this.popup.children[this.active]?.scrollIntoView({ block: 'nearest' })
    }
    private choose = (index: number, event: Event): void => {
        const option = this.choices[index], range = this.match
        if (!option || !range || this.adapter.blocked?.()) return
        this.close()
        if (this.adapter.replace(range, option.insertText, event)) this.config()?.onSelect?.({ option, range, originalEvent: event })
    }
    private keydown = (event: KeyboardEvent): void => {
        if (this.composing || event.isComposing || !this.match) return
        if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(event.key)) return
        event.preventDefault(); event.stopImmediatePropagation()
        if (event.key === 'Escape' || event.key === 'Tab') { this.suppressed = JSON.stringify(this.match); this.close() }
        else if (event.key === 'Enter') this.choose(this.active, event)
        else { this.active = (this.active + (event.key === 'ArrowDown' ? 1 : -1) + this.choices.length) % this.choices.length; this.render() }
    }
    close = (): void => {
        this.match = null; this.popupController?.dispose(); this.popupController = undefined; this.popup?.remove(); this.popup = undefined
        this.view?.([], -1, this.adapter.caretRect(), this.choose)
        for (const [name, value] of this.original) { if (value === null) this.adapter.element.removeAttribute(name); else this.adapter.element.setAttribute(name, value) }
    }
    dispose = (): void => { this.close(); this.abort.abort() }
}
export function nativeMentionAdapter(element: HTMLInputElement | HTMLTextAreaElement, commit: (value: string, event: Event) => boolean): MentionAdapter {
    return { element, text: () => element.value,
        selection: () => element.selectionStart === null ? null : { start: element.selectionStart, end: element.selectionEnd ?? element.selectionStart },
        blocked: () => element.disabled || element.readOnly,
        replace: (range, text, event) => {
            const next = element.value.slice(0, range.start) + text + element.value.slice(range.end)
            if (!commit(next, event)) return false
            element.value = next; element.focus({ preventScroll: true }); element.setSelectionRange(range.start + text.length, range.start + text.length)
            return true
        },
        caretRect: () => {
            const document = element.ownerDocument, mirror = document.createElement('div'), marker = document.createElement('span')
            const style = document.defaultView!.getComputedStyle(element), rect = element.getBoundingClientRect()
            for (const name of ['font', 'letter-spacing', 'padding', 'border', 'box-sizing', 'line-height', 'text-indent']) mirror.style.setProperty(name, style.getPropertyValue(name))
            mirror.style.cssText += `;position:fixed;visibility:hidden;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;white-space:pre-wrap;overflow-wrap:break-word`
            mirror.textContent = element.value.slice(0, element.selectionStart ?? 0); marker.textContent = '\u200b'; mirror.append(marker); document.body.append(mirror)
            mirror.scrollTop = element.scrollTop; mirror.scrollLeft = element.scrollLeft
            const caret = marker.getBoundingClientRect(); mirror.remove(); return caret
        },
    }
}
