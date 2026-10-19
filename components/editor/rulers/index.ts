import { type Template, html, repeat, when, state } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
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
    private readonly dimensions = state({width:960,height:480});
    private get surface(): HTMLElement | undefined { const node=this.refs.surface?.[0]; return node instanceof HTMLElement ? node : undefined; }
    render(): Template {
        const ticks = (axis: 'x' | 'y'): Template => html`${repeat(() => this.ticks(axis), tick => html`
            <span part="tick" data-major=${tick.major ? '' : null} style=${`${axis === 'x' ? 'inset-inline-start' : 'inset-block-start'}:${tick.pixel}px`}></span>
            ${when(() => tick.major, () => html`<span part="tick-label" style=${`${axis === 'x' ? 'inset-inline-start' : 'inset-block-start'}:${Math.max(14,tick.pixel)}px`}>${() => `${Math.round(tick.value*100)/100}${scalarText(this.unit)}`}</span>`)}
        `, {key: tick => tick.value})}`;
        return html`<style part="styles">${css}</style><div part="root rulers">
            <span part="corner"></span><div part="horizontal ruler" ref="horizontal">${ticks('x')}</div><div part="vertical ruler" ref="vertical">${ticks('y')}</div>
            <div part="surface canvas control" ref="surface" role="region" tabindex=${() => this.unavailable ? -1 : 0}
                aria-label=${() => this.accessibleName()} aria-disabled=${() => this.unavailable || null}
                style=${() => `--cb-cursor-x:${(finite(this.cursorX)-finite(this.originX))*this.scale()}px;--cb-cursor-y:${(finite(this.cursorY)-finite(this.originY))*this.scale()}px`}
                onpointermove=${(event: PointerEvent) => this.trackPointer(event,false)}
                onpointerdown=${(event: PointerEvent) => this.trackPointer(event,true)} onkeydown=${(event: KeyboardEvent) => this.onKeydown(event)}>
                <slot part="content"></slot><span part="guide-x" hidden=${() => !this.cursorVisible()}></span><span part="guide-y" hidden=${() => !this.cursorVisible()}></span>
                <output part="cursor" hidden=${() => !this.cursorVisible() || !this.coordinateText()}>${() => this.coordinateText()}</output>
            </div></div>`;
    }
    protected mount(): void {
        const horizontal=this.refs.horizontal?.[0],vertical=this.refs.vertical?.[0];
        const observer=new ResizeObserver(() => this.dimensions[1]({width:Math.max(horizontal?.clientWidth ?? 0,960),height:Math.max(vertical?.clientHeight ?? 0,480)}));
        if(horizontal) observer.observe(horizontal);
        if(vertical) observer.observe(vertical);
        this.cleanup(() => observer.disconnect());
    }
    private ticks(axis: 'x' | 'y'): readonly {value:number;pixel:number;major:boolean}[] {
        const step=this.step(), minor=step/this.divisions(), origin=axis === 'x' ? finite(this.originX) : finite(this.originY);
        const limit=(axis === 'x' ? this.dimensions[0]().width : this.dimensions[0]().height)/this.scale();
        const first=Math.floor(origin/minor)*minor, count=Math.min(240,Math.ceil(limit/minor)+this.divisions()*2);
        return Array.from({length:count+this.divisions()+1},(_,index) => {
            const value=first+(index-this.divisions())*minor;
            return {value,pixel:(value-origin)*this.scale(),major:Math.abs(value/step-Math.round(value/step))<.001};
        });
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
