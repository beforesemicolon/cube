import componentStylesheet from './styles.css?inline'
import { isNot, or, type Template, html, repeat, when, state } from '../../core/runtime.js'

import { finite, scalarText } from '../../core/value.js';

import { RulersBase } from './RulersBase.js';

export class Rulers extends RulersBase {
    stylesheet = componentStylesheet

    private readonly dimensions = state({width:960,height:480});
    private get surface(): HTMLElement | undefined { const node=this.refs.surface?.[0]; return node instanceof HTMLElement ? node : undefined; }
    render(): Template {
        const ticks = (axis: 'x' | 'y'): Template => html`${repeat(() => this.ticks(axis), tick => html`
            <span part="tick" data-major=${tick.major ? '' : null} style=${`${axis === 'x' ? 'inset-inline-start' : 'inset-block-start'}:${tick.pixel}px`}></span>
            ${when(tick.major, () => html`<span part="tick-label" style=${`${axis === 'x' ? 'inset-inline-start' : 'inset-block-start'}:${Math.max(14,tick.pixel)}px`}>${() => `${Math.round(tick.value*100)/100}${scalarText(this.unit)}`}</span>`)}
        `, {key: tick => tick.value})}`;
        return html`<div part="root rulers">
            <span part="corner"></span><div part="horizontal ruler" ref="horizontal">${ticks('x')}</div><div part="vertical ruler" ref="vertical">${ticks('y')}</div>
            <div part="surface canvas control" ref="surface" role="region" tabindex=${() => this.unavailable ? -1 : 0}
                aria-label=${this.accessibleName} aria-disabled=${() => this.unavailable || null}
                style=${() => `--cb-cursor-x:${(finite(this.cursorX)-finite(this.originX))*this.scale()}px;--cb-cursor-y:${(finite(this.cursorY)-finite(this.originY))*this.scale()}px`}
                onpointermove=${(event: PointerEvent) => this.trackPointer(event,false)}
                onpointerdown=${(event: PointerEvent) => this.trackPointer(event,true)} onkeydown=${this.onKeydown}>
                <slot part="content"></slot><span part="guide-x" hidden=${isNot(this.cursorVisible)}></span><span part="guide-y" hidden=${isNot(this.cursorVisible)}></span>
                <output part="cursor" hidden=${or(isNot(this.cursorVisible), isNot(this.coordinateText))}>${this.coordinateText}</output>
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
    private onKeydown = (event: KeyboardEvent): void => {
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
