import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { bool, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { ArtboardBase } from './ArtboardBase.js';
const css = editorCSS + `
:host{display:block;inline-size:min(100%,var(--cb-artboard-width));min-inline-size:0}
[part~=frame]{position:relative;display:block;inline-size:100%;aspect-ratio:var(--cb-artboard-ratio);border:1px solid ${v('--color-border')};border-radius:var(--component-artboard-radius,2px);background:var(--cb-artboard-background,${v('--color-surface')});box-shadow:0 8px 28px color-mix(in srgb,${v('--color-foreground')} 14%,transparent);overflow:visible}
[part~=frame][aria-current=true]{border-color:${v('--color-primary')};box-shadow:0 0 0 2px ${v('--color-focus')},0 10px 32px color-mix(in srgb,${v('--color-foreground')} 18%,transparent)}
[part~=content]{display:block;inline-size:100%;block-size:100%;overflow:hidden}
[part~=dimensions]{position:absolute;inset-inline-start:50%;inset-block-start:calc(100% + 6px);translate:-50% 0;margin:0;padding:2px 6px;border-radius:var(--radius-sm,6px);background:${v('--color-surface-raised')};color:${v('--color-muted-foreground')};font:var(--component-code-font,10px/1.4 ui-monospace,monospace);font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none}
:host([data-disabled]) [part~=frame]{opacity:var(--component-disabled-opacity,.5)}
`;
export class Artboard extends ArtboardBase {
    private frame?: HTMLElement;
    private dimensions?: HTMLOutputElement;
    render(): Template {
        this.frame = element('div', { attributes: { part: 'frame canvas canvas-marker control' } }) as HTMLDivElement;
        this.frame.setAttribute('role', 'region');
        this.frame.tabIndex = 0;
        const content = element('slot', { attributes: { part: 'content' } }) as HTMLSlotElement;
        this.dimensions = element('output', { attributes: { part: 'dimensions' } }) as HTMLOutputElement;
        this.frame.append(content, this.dimensions);
        this.frame.addEventListener('click', event => this.select(true, event));
        this.frame.addEventListener('keydown', event => {
            if ((event.key === 'Enter' || event.key === ' ') && this.canSelect()) {
                event.preventDefault();
                this.select(true, event);
            }
        });
        return html`<style part="styles">${css}</style>${this.frame}`;
    }
    protected syncView(): void {
        if (!this.frame || !this.dimensions)
            return;
        const width = this.artboardWidth();
        const height = this.artboardHeight();
        this.style.setProperty('--cb-artboard-width', `${width}px`);
        this.style.setProperty('--cb-artboard-ratio', `${width} / ${height}`);
        this.style.setProperty('--cb-artboard-background', scalarText(this.background) || v('--color-surface'));
        this.frame.tabIndex = this.canSelect() ? 0 : -1;
        aria(this.frame, 'aria-label', this.accessibleName());
        aria(this.frame, 'aria-disabled', this.unavailable ? true : null);
        aria(this.frame, 'aria-current', this.canSelect() && bool(this.selected) ? true : null);
        this.dimensions.value = this.dimensionsText();
        this.dimensions.hidden = !bool(this.showDimensions, true) || !this.dimensions.value;
    }
}
export { ArtboardBase };
export type { ArtboardProps } from './ArtboardBase.js';
