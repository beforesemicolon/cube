import { register } from '../../core/Component.js'
import componentStylesheet from './view.css?inline'
import { html, when, type Template } from '../../core/runtime.js'
import { bool } from '../../core/value.js'
import { MenuBase, type MenuProps } from './MenuBase.js'
import { MenuScrollControls } from './scroll-controls.js'
import { createMenuView, type MenuView } from './view.js'

export class Menu extends MenuBase<MenuProps> {
    static observedAttributes = [...MenuBase.observedAttributes, 'scroll-controls']
    scrollControls = false

    stylesheet = componentStylesheet

    private view?: MenuView
    private scrollControlsView?: MenuScrollControls

    render(): Template {
        const view = createMenuView(this, (item, event) => this.activate(item, event))
        this.view = view
        const enabled = () => bool(this.scrollControls)
        const root = html`<div ref="frame" class="menu-scroll-frame"
            data-scroll-controls="${() => enabled() ? '' : null}"
            data-vertical="${() => bool(this.stacked) ? '' : null}"
        >
            ${when(enabled, html`<div class="menu-scroll-slot">
                <cb-button ref="previous" variant="ghost"
                    class="menu-scroll-previous"
                    part="scroll-control scroll-previous"
                    accessible-label="Scroll to previous menu items" hidden
                    onaction="${(event: Event) => this.scrollToHiddenItem(-1, event)}"
                ><span class="menu-scroll-arrow" aria-hidden="true"></span></cb-button>
            </div>`)}
            ${view.root}
            ${when(enabled, html`<div class="menu-scroll-slot">
                <cb-button ref="next" variant="ghost"
                    class="menu-scroll-next"
                    part="scroll-control scroll-next"
                    accessible-label="Scroll to next menu items" hidden
                    onaction="${(event: Event) => this.scrollToHiddenItem(1, event)}"
                ><span class="menu-scroll-arrow" aria-hidden="true"></span></cb-button>
            </div>`)}
        </div>`

        return root.onMount(() => {
            const frame = root.refs.frame?.[0]
            const menu = view.menu
            if (!(frame instanceof HTMLElement) || !menu) return
            const controller = new MenuScrollControls(
                frame,
                menu,
                () => {
                    const node = root.refs.previous?.[0]
                    return node instanceof HTMLElement ? node : undefined
                },
                () => {
                    const node = root.refs.next?.[0]
                    return node instanceof HTMLElement ? node : undefined
                },
                () => bool(this.stacked),
                enabled,
                view.focusCurrent
            )
            this.scrollControlsView = controller
            const unmount = controller.mount()
            return () => {
                unmount()
                if (this.scrollControlsView === controller) this.scrollControlsView = undefined
            }
        })
    }

    private scrollToHiddenItem(direction: -1 | 1, event: Event): void {
        event.stopPropagation()
        this.scrollControlsView?.reveal(direction)
    }

    protected syncView(): void {
        this.view?.update()
        this.scrollControlsView?.refresh()
    }

    focus(options?: FocusOptions): void {
        if (this.view?.menu) {
            this.view.focusFirst()
            return
        }
        super.focus(options)
    }
}
export { MenuBase }
export type { MenuProps, MenuVariant } from './MenuBase.js'
export type { ActionItem } from '../../core/items.js'

register('cb-menu', Menu)
