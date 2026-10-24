import { register } from '../../core/Component.js'
import componentStylesheet from '../../navigation/menu/view.css?inline'
import { type Template } from '../../core/runtime.js'
import { bool, finite } from '../../core/value.js';
import { ContextMenuBase } from './ContextMenuBase.js';
import { createMenuView, type MenuView } from '../../navigation/menu/view.js'
import { PopupController } from '../../core/popup.js'
export class ContextMenu extends ContextMenuBase {
    stylesheet = componentStylesheet

    private view?: MenuView;
    private popup?: PopupController;
    private point?: { x: number; y: number };
    render(): Template {
        this.view = createMenuView(this, (item, event) => { this.activate(item, event); this.close(); });
        return this.view.root;
    }
    protected mount(): void {
        super.mount();
        this.cleanup(() => this.popup?.dispose());
    }
    protected syncView(): void {
        this.view?.update();
        this.hidden = !bool(this.open);
        const menu = this.view?.menu;
        if (!menu) return;
        this.popup ??= new PopupController(menu, this, () => this.close());
        if (!bool(this.open)) { this.popup.hide(); this.point = undefined; return; }
        const point = { x: finite(this.x), y: finite(this.y) };
        const repositioned = !this.point || point.x !== this.point.x || point.y !== this.point.y;
        if (repositioned) this.popup.hide();
        this.popup.show(point);
        if (repositioned) this.view?.focusFirst();
        this.point = point;
    }
}
export { ContextMenuBase };
export type { ContextMenuProps } from './ContextMenuBase.js';

register('cb-context-menu', ContextMenu)
