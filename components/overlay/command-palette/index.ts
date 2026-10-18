import type { Menu } from '../../navigation/menu/index.js'
import '../../navigation/menu/index.js'
import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, uid } from '../../core/editor-dom.js'
import type { NormalizedItem } from '../../core/items.js'
import { bool, scalarText } from '../../core/value.js'
import { createIcon } from '../../icons/paths.js'
import { CommandPaletteBase } from './CommandPaletteBase.js'

export class CommandPalette extends CommandPaletteBase {
    private dialog?: HTMLDialogElement
    private input?: HTMLInputElement
    private menu?: Menu
    private empty?: HTMLElement
    render(): Node {
        this.dialog = el('dialog', 'dialog')
        const search = el('label', 'search'); search.append(createIcon('search'))
        this.input = el('input', 'input'); this.input.type = 'search'; this.input.id = uid('cb-command-search'); this.input.addEventListener('input', () => { this.query = this.input?.value ?? ''; this.syncView() }); search.append(this.input)
        this.menu = document.createElement('cb-menu') as Menu; this.menu.setAttribute('part', 'results'); this.menu.addEventListener('cb-action', event => { const detail = (event as CustomEvent<{ item: NormalizedItem }>).detail; if (detail.item) this.select(detail.item, event) })
        this.empty = el('p', 'empty')
        this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.close() })
        this.dialog.append(search, this.menu, this.empty)
        return fragment(sheet(editorCSS + `:host{display:contents}[part=dialog]{inline-size:min(560px,calc(100vw - 24px));max-block-size:min(70dvh,640px);padding:var(--spacing-sm,8px);border:1px solid var(--color-separator,#dae0e4);border-radius:var(--radius-md,10px);background:var(--color-surface-raised,#fff);color:var(--color-foreground,#20262b);box-shadow:0 24px 70px rgba(12,18,24,.24)}[part=dialog]::backdrop{background:var(--component-overlay-backdrop,rgba(10,16,22,.56))}[part=search]{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:var(--spacing-sm,8px);padding:var(--spacing-xs,4px) var(--spacing-sm,8px);border:1px solid var(--color-border,#8a959f);border-radius:var(--radius-sm,6px)}[part=input]{inline-size:100%;min-block-size:28px;padding:0;border:0;background:transparent;outline:0}[part=results]{margin-block-start:var(--spacing-sm,8px)}[part=empty]{padding:var(--spacing-lg,16px);text-align:center}`), this.dialog)
    }
    protected syncView(): void {
        if (!this.dialog || !this.input || !this.menu || !this.empty) return
        this.input.placeholder = scalarText(this.placeholder); this.input.setAttribute('aria-label', this.accessibleName()); if (this.input.value !== scalarText(this.query)) this.input.value = scalarText(this.query)
        Object.assign(this.menu, { items: this.results, accessibleLabel: this.accessibleName() })
        this.empty.textContent = scalarText(this.emptyLabel); this.empty.hidden = this.results.length > 0 || !this.empty.textContent
        if (bool(this.open) && !this.dialog.open) { try { this.dialog.showModal(); this.input.focus() } catch (error) { this.onError(error) } }
        else if (!bool(this.open) && this.dialog.open) this.dialog.close()
    }
}

register('cb-command-palette', CommandPalette)
export { CommandPaletteBase }
export type { CommandPaletteProps } from './CommandPaletteBase.js'
