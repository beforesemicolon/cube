import componentStylesheet from './styles.css?inline'
import { isNot, or, html, type Template } from '../../core/runtime.js'

import { bool, scalarText } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import { ArtboardBase } from './ArtboardBase.js'

export class Artboard extends ArtboardBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`
            <div part="frame canvas canvas-marker control" role="region" tabindex="${() => this.canSelect() ? 0 : -1}"
                aria-label="${this.accessibleName}" aria-disabled="${() => this.unavailable ? 'true' : null}"
                aria-current="${() => this.canSelect() && bool(this.selected) ? 'true' : null}"
                onclick="${(event: Event) => this.select(true, event)}"
                onkeydown="${(event: KeyboardEvent) => { if ((event.key === 'Enter' || event.key === ' ') && this.canSelect()) { event.preventDefault(); this.select(true, event) } }}">
                <slot part="content"></slot>
                <output part="dimensions" hidden="${or(isNot(() => bool(this.showDimensions, true)), isNot(this.dimensionsText))}">${this.dimensionsText}</output>
            </div>`
    }
    protected syncView(): void {
        this.style.setProperty('--cb-artboard-width', this.artboardWidth() + 'px')
        this.style.setProperty('--cb-artboard-ratio', this.artboardWidth() + ' / ' + this.artboardHeight())
        this.style.setProperty('--cb-artboard-background', scalarText(this.background) || v('--color-surface'))
    }
}
export { ArtboardBase };
export type { ArtboardProps } from './ArtboardBase.js';
