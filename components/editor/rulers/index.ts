import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { finite, scalarText } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { RulersBase } from './RulersBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=root]{display:grid;grid-template:var(--component-ruler-size,28px) minmax(240px,1fr)/var(--component-ruler-size,28px) minmax(0,1fr);overflow:hidden;border:1px solid ${v('--color-border')};border-radius:var(--radius-md,10px);background:${v('--color-surface')};box-shadow:0 6px 20px color-mix(in srgb,${v('--color-foreground')} 10%,transparent)}
[part~=corner]{z-index:3;grid-area:1/1;border-inline-end:1px solid ${v('--color-separator')};border-block-end:1px solid ${v('--color-separator')};background:${v('--color-surface-raised')}}
[part~=horizontal],[part~=vertical]{position:relative;z-index:2;overflow:hidden;background:${v('--color-surface-raised')};color:${v('--color-muted-foreground')};font:var(--component-code-font,9px/1 ui-monospace,monospace);font-variant-numeric:tabular-nums;pointer-events:none}
[part~=horizontal]{grid-area:1/2;border-block-end:1px solid ${v('--color-separator')}}
[part~=vertical]{grid-area:2/1;border-inline-end:1px solid ${v('--color-separator')}}
[part~=tick]{position:absolute;color:${v('--color-border')};border-color:currentColor}
[part~=horizontal] [part~=tick]{inset-block-end:0;block-size:6px;border-inline-start:1px solid}
[part~=vertical] [part~=tick]{inset-inline-end:0;inline-size:6px;border-block-start:1px solid}
[part~=tick][data-major]{color:${v('--color-muted-foreground')}}
[part~=horizontal] [part~=tick][data-major]{block-size:12px}
[part~=vertical] [part~=tick][data-major]{inline-size:12px}
[part~=tick-label]{position:absolute;white-space:nowrap;pointer-events:none}
[part~=horizontal] [part~=tick-label]{inset-block-start:4px;translate:-50% 0}
[part~=vertical] [part~=tick-label]{inset-inline-start:3px;translate:0 -50%;writing-mode:vertical-rl}
[part~=surface]{position:relative;grid-area:2/2;overflow:hidden;min-block-size:var(--component-rulers-height,380px);background:${v('--color-surface-muted')};outline-offset:-2px;cursor:crosshair}
[part~=content]{display:block;inline-size:100%;block-size:100%}
[part~=guide-x],[part~=guide-y]{position:absolute;z-index:2;background:${v('--color-primary')};pointer-events:none}
[part~=guide-x]{inset-block:0;inline-size:1px;inset-inline-start:var(--cb-cursor-x)}
[part~=guide-y]{inset-inline:0;block-size:1px;inset-block-start:var(--cb-cursor-y)}
[part~=cursor]{position:absolute;z-index:3;inset-inline-start:var(--cb-cursor-x);inset-block-start:var(--cb-cursor-y);translate:8px 8px;margin:0;padding:3px 6px;border:1px solid ${v('--color-primary')};border-radius:var(--radius-sm,6px);background:${v('--color-surface-raised')};color:${v('--color-foreground')};font:var(--component-code-font,10px/1.3 ui-monospace,monospace);white-space:nowrap;pointer-events:none}
:host([data-disabled]) [part~=root]{opacity:var(--component-disabled-opacity,.5)}
`;
export class Rulers extends RulersBase {
    private horizontal?: HTMLElement;
    private vertical?: HTMLElement;
    private surface?: HTMLElement;
    private guideX?: HTMLElement;
    private guideY?: HTMLElement;
    private cursor?: HTMLOutputElement;
    render(): Template {
        const root = element('div', { attributes: { part: 'root rulers' } }) as HTMLDivElement;
        const corner = element('span', { attributes: { part: 'corner' } }) as HTMLSpanElement;
        this.horizontal = element('div', { attributes: { part: 'horizontal ruler' } }) as HTMLDivElement;
        this.vertical = element('div', { attributes: { part: 'vertical ruler' } }) as HTMLDivElement;
        this.surface = element('div', { attributes: { part: 'surface canvas control' } }) as HTMLDivElement;
        this.surface.tabIndex = 0;
        this.surface.setAttribute('role', 'region');
        const content = element('slot', { attributes: { part: 'content' } }) as HTMLSlotElement;
        this.guideX = element('span', { attributes: { part: 'guide-x' } }) as HTMLSpanElement;
        this.guideY = element('span', { attributes: { part: 'guide-y' } }) as HTMLSpanElement;
        this.cursor = element('output', { attributes: { part: 'cursor' } }) as HTMLOutputElement;
        this.surface.append(content, this.guideX, this.guideY, this.cursor);
        root.append(corner, this.horizontal, this.vertical, this.surface);
        this.surface.addEventListener('pointermove', event => this.trackPointer(event, false));
        this.surface.addEventListener('pointerdown', event => this.trackPointer(event, true));
        this.surface.addEventListener('keydown', event => this.onKeydown(event));
        return html`<style part="styles">${css}</style>${root}`;
    }
    protected syncView(): void {
        if (!this.horizontal || !this.vertical || !this.surface || !this.guideX || !this.guideY || !this.cursor)
            return;
        this.renderTicks(this.horizontal, 'x');
        this.renderTicks(this.vertical, 'y');
        const x = (finite(this.cursorX) - finite(this.originX)) * this.scale();
        const y = (finite(this.cursorY) - finite(this.originY)) * this.scale();
        this.surface.style.setProperty('--cb-cursor-x', `${x}px`);
        this.surface.style.setProperty('--cb-cursor-y', `${y}px`);
        const visible = this.cursorVisible();
        this.guideX.hidden = !visible;
        this.guideY.hidden = !visible;
        this.cursor.hidden = !visible || !this.coordinateText();
        this.cursor.value = this.coordinateText();
        this.surface.tabIndex = this.unavailable ? -1 : 0;
        aria(this.surface, 'aria-label', this.accessibleName());
        aria(this.surface, 'aria-disabled', this.unavailable ? true : null);
    }
    private renderTicks(container: HTMLElement, axis: 'x' | 'y'): void {
        container.replaceChildren();
        const step = this.step();
        const minor = step / this.divisions();
        const origin = axis === 'x' ? finite(this.originX) : finite(this.originY);
        const pixelLimit = axis === 'x' ? Math.max(container.clientWidth, 960) : Math.max(container.clientHeight, 480);
        const logicalLimit = pixelLimit / this.scale();
        const first = Math.floor(origin / minor) * minor;
        const count = Math.min(240, Math.ceil(logicalLimit / minor) + this.divisions() * 2);
        for (let index = -this.divisions(); index <= count; index += 1) {
            const value = first + index * minor;
            const pixel = (value - origin) * this.scale();
            const tick = element('span', { attributes: { part: 'tick' } }) as HTMLSpanElement;
            const isMajor = Math.abs(value / step - Math.round(value / step)) < .001;
            if (isMajor)
                tick.dataset.major = '';
            tick.style.setProperty(axis === 'x' ? 'inset-inline-start' : 'inset-block-start', `${pixel}px`);
            container.append(tick);
            if (isMajor) {
                const label = element('span', { attributes: { part: 'tick-label' }, textContent: `${Math.round(value * 100) / 100}${scalarText(this.unit)}` }) as HTMLSpanElement;
                label.style.setProperty(axis === 'x' ? 'inset-inline-start' : 'inset-block-start', `${Math.max(14, pixel)}px`);
                container.append(label);
            }
        }
    }
    private trackPointer(event: PointerEvent, commit: boolean): void {
        if (!this.surface || this.unavailable)
            return;
        const rect = this.surface.getBoundingClientRect();
        const x = finite(this.originX) + (event.clientX - rect.left) / this.scale();
        const y = finite(this.originY) + (event.clientY - rect.top) / this.scale();
        this.setCursor(x, y, event, commit);
    }
    private onKeydown(event: KeyboardEvent): void {
        const amount = event.shiftKey ? 10 : 1;
        const deltas: Readonly<Record<string, readonly [
            number,
            number
        ]>> = { ArrowLeft: [-amount, 0], ArrowRight: [amount, 0], ArrowUp: [0, -amount], ArrowDown: [0, amount] };
        const delta = deltas[event.key];
        if (!delta || this.unavailable)
            return;
        event.preventDefault();
        this.setCursor(finite(this.cursorX) + delta[0], finite(this.cursorY) + delta[1], event, true);
    }
}
export { RulersBase };
export type { RulersProps } from './RulersBase.js';
