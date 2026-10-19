import { isNot, or, css as componentStyles, html, type Template } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { bool, scalarText } from '../../core/value.js'
import { token as v } from '../../theme/tokens.js'
import { ArtboardBase } from './ArtboardBase.js'
const css = editorCSS + `
:host{display:block;inline-size:min(100%,var(--cb-artboard-width));min-inline-size:0}
[part~=frame]{position:relative;display:block;inline-size:100%;aspect-ratio:var(--cb-artboard-ratio);border:1px solid ${v('--color-border')};border-radius:var(--component-artboard-radius,2px);background:var(--cb-artboard-background,${v('--color-surface')});box-shadow:0 8px 28px color-mix(in srgb,${v('--color-foreground')} 14%,transparent);overflow:visible}
[part~=frame][aria-current=true]{border-color:${v('--color-primary')};box-shadow:0 0 0 2px ${v('--color-focus')},0 10px 32px color-mix(in srgb,${v('--color-foreground')} 18%,transparent)}
[part~=content]{display:block;inline-size:100%;block-size:100%;overflow:hidden}
[part~=dimensions]{position:absolute;inset-inline-start:50%;inset-block-start:calc(100% + 6px);translate:-50% 0;margin:0;padding:2px 6px;border-radius:var(--radius-sm,6px);background:${v('--color-surface-raised')};color:${v('--color-muted-foreground')};font:var(--component-code-font,10px/1.4 ui-monospace,monospace);font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none}
:host([data-disabled]) [part~=frame]{opacity:var(--component-disabled-opacity,.5)}
`;
export class Artboard extends ArtboardBase {
    stylesheet = componentStyles`${css}`

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
