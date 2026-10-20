import componentStylesheet from './view.css?inline'
import { type Template } from '../../core/runtime.js'
import { ButtonBase } from './ButtonBase.js';
import { buttonView } from './view.js'
export class Button extends ButtonBase {
    stylesheet = componentStylesheet

    protected view?: ReturnType<typeof buttonView>;
    render(): Template { this.view = buttonView(this, e => this.activate(e)); return this.view.root; }
    protected mount(): void {
        if (this.hasAttribute('data-semantic-host')) {
            this.listen(this, 'click', event => this.activate(event));
            this.listen(this, 'keydown', event => {
                const key = (event as KeyboardEvent).key;
                if (event.defaultPrevented || key !== 'Enter' && key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                this.activate(event);
            });
        }
        super.mount();
    }
    protected actionElement() { return this.view?.control; }
    protected syncView(): void { this.view?.update(); }
}
export { ButtonBase };
export type { ButtonProps, ButtonVariant } from './ButtonBase.js';
