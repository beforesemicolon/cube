import { register } from '../../core/Component.js'
import componentStylesheet from './view.css?inline'
import { type Template } from '../../core/runtime.js'
import { MenuBase } from './MenuBase.js';
import { createMenuView, type MenuView } from './view.js'
export class Menu extends MenuBase {
    stylesheet = componentStylesheet

    private view?: MenuView;
    render(): Template { this.view = createMenuView(this, (item, event) => this.activate(item, event)); return this.view.root; }
    protected syncView(): void { this.view?.update(); }
    focus(options?: FocusOptions): void { const menu = this.view?.menu; if (menu) {
        this.view?.focusFirst();
        return;
    } super.focus(options); }
}
export { MenuBase };
export type { MenuProps } from './MenuBase.js';
export type { ActionItem } from '../../core/items.js';

register('cb-menu', Menu)
