import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { isNot, type Template, html, repeat } from '../../core/runtime.js'

import { finite } from '../../core/value.js';

import { BezierBase } from './BezierBase.js';

interface DragState {
    readonly point: 1 | 2;
    readonly pointerId: number;
    readonly handle: SVGCircleElement;
}
export class Bezier extends BezierBase {
    stylesheet = componentStylesheet

    private get graph(): SVGSVGElement | undefined { const node=this.refs.graph?.[0]; return node instanceof SVGSVGElement ? node : undefined; }
    private drag?: DragState;
    render(): Template {
        const coordinate = (point: 1 | 2,axis: 'x' | 'y'): number => { const value=this.curve(); return point === 1 ? axis === 'x' ? value.x1 : value.y1 : axis === 'x' ? value.x2 : value.y2; };
        const position = (point: 1 | 2): {x:number;y:number} => this.point(coordinate(point,'x'),coordinate(point,'y'));
        return html`<section part="root editor"><header part="header">
            <span part="label" hidden=${isNot(this.displayLabel)}>${this.displayLabel}</span><div part="actions">
                <cb-button part="play" exportparts="control:play-control,label:play-label,button-label:play-label,icon:play-icon,description:play-description" icon-only icon=${() => this.playing ? 'pause' : 'play'} variant="ghost" size="sm"
                    accessible-label=${() => this.text(this.playing ? 'pauseLabel' : 'playLabel')} disabled=${() => this.unavailable}
                    onaction=${(event: Event) => { event.stopPropagation(); this.setPlaying(!this.playing,event); }}></cb-button>
                <cb-button part="reset" exportparts="control:reset-control,label:reset-label,button-label:reset-label,icon:reset-icon,description:reset-description" icon-only icon="reset" variant="ghost" size="sm" accessible-label=${() => this.text('resetLabel')} disabled=${() => this.unavailable}
                    onaction=${(event: Event) => { event.stopPropagation(); this.reset(event); }}></cb-button></div></header>
            <div part="workspace"><svg part="graph control" ref="graph" viewBox="0 0 320 240" role="group"
                tabindex=${() => this.unavailable ? -1 : 0} aria-label=${() => this.text('curveLabel') || this.accessibleName()} aria-disabled=${() => this.unavailable || null}
                onpointermove=${this.moveHandle} onpointerup=${this.endHandle} onpointercancel=${this.endHandle}>
                <line part="grid-line" x1="28" x2="28" y1="28" y2="212"></line><line part="grid-line" x1="28" x2="292" y1="28" y2="28"></line>
<line part="grid-line" x1="94" x2="94" y1="28" y2="212"></line><line part="grid-line" x1="28" x2="292" y1="74" y2="74"></line>
<line part="grid-line" x1="160" x2="160" y1="28" y2="212"></line><line part="grid-line" x1="28" x2="292" y1="120" y2="120"></line>
<line part="grid-line" x1="226" x2="226" y1="28" y2="212"></line><line part="grid-line" x1="28" x2="292" y1="166" y2="166"></line>
<line part="grid-line" x1="292" x2="292" y1="28" y2="212"></line><line part="grid-line" x1="28" x2="292" y1="212" y2="212"></line>
                <line part="axis" x1="28" x2="292" y1="166" y2="166"></line><line part="axis" x1="28" x2="28" y1="28" y2="212"></line>
                <line part="handle-line" x1="28" y1="166" x2=${() => position(1).x} y2=${() => position(1).y}></line>
<line part="handle-line" x1="292" y1="28" x2=${() => position(2).x} y2=${() => position(2).y}></line>
                <path part="curve" d=${() => { const a=position(1),b=position(2); return `M28 166 C${a.x} ${a.y} ${b.x} ${b.y} 292 28`; }}></path>
                <circle part="handle handle-1" r="7" role="slider"
                    tabindex=${() => this.unavailable ? -1 : 0} cx=${() => position(1).x} cy=${() => position(1).y}
                    aria-valuemin="-1" aria-valuemax="2" aria-valuenow=${() => coordinate(1,'y')}
                    aria-valuetext=${() => `${Math.round(coordinate(1,'x')*100)/100}, ${Math.round(coordinate(1,'y')*100)/100}`}
                    aria-label=${() => `${this.text('x1Label')}, ${this.text('y1Label')}`}
                    onpointerdown=${(event: PointerEvent) => {
                        if(this.unavailable || !(event.currentTarget instanceof SVGCircleElement)) return;
                        this.drag={point:1,pointerId:event.pointerId,handle:event.currentTarget}; event.currentTarget.setPointerCapture(event.pointerId);
                    }} onkeydown=${(event: KeyboardEvent) => this.keyHandle(1,event)}></circle>
<circle part="handle handle-2" r="7" role="slider"
                    tabindex=${() => this.unavailable ? -1 : 0} cx=${() => position(2).x} cy=${() => position(2).y}
                    aria-valuemin="-1" aria-valuemax="2" aria-valuenow=${() => coordinate(2,'y')}
                    aria-valuetext=${() => `${Math.round(coordinate(2,'x')*100)/100}, ${Math.round(coordinate(2,'y')*100)/100}`}
                    aria-label=${() => `${this.text('x2Label')}, ${this.text('y2Label')}`}
                    onpointerdown=${(event: PointerEvent) => {
                        if(this.unavailable || !(event.currentTarget instanceof SVGCircleElement)) return;
                        this.drag={point:2,pointerId:event.pointerId,handle:event.currentTarget}; event.currentTarget.setPointerCapture(event.pointerId);
                    }} onkeydown=${(event: KeyboardEvent) => this.keyHandle(2,event)}></circle>
            </svg><div part="fields">
                ${repeat(() => [{point:1,axis:'x',key:'x1Label'},{point:1,axis:'y',key:'y1Label'},{point:2,axis:'x',key:'x2Label'},{point:2,axis:'y',key:'y2Label'}] as const, field => html`
                    <label part=${`field point-${field.point}-${field.axis}`}><span part="field-label" hidden=${isNot(() => this.text(field.key))}>${() => this.text(field.key)}</span>
                        <cb-number-input part=${`field-control point-${field.point}-${field.axis}-control`} accessible-label=${() => this.text(field.key)}
                            min=${field.axis === 'x' ? 0 : -1} max=${field.axis === 'x' ? 1 : 2} step="0.01" value=${() => coordinate(field.point,field.axis)} disabled=${() => this.unavailable}
                            onchange=${(event: CustomEvent<{value:string|number}>) => {
                                event.stopPropagation(); const value=Number(event.detail.value);
                                this.setPoint(field.point,field.axis === 'x' ? value : coordinate(field.point,'x'),field.axis === 'y' ? value : coordinate(field.point,'y'),event);
                            }}></cb-number-input></label>`,{key:field=>field.key})}
                <output part="value" tabindex="0">${this.cssValue}</output>
                <div part="preview" role="img" aria-label=${() => this.text('previewLabel')} data-playing=${() => this.playing ? '' : null}
                    style=${() => `--cb-duration:${Math.max(50,finite(this.duration,1000))}ms;--cb-easing:${this.cssValue()}`}><span part="preview-dot"></span></div>
            </div></div></section>`;
    }
    protected syncView(): void { this.value=this.cssValue(); }
    private moveHandle = (event: PointerEvent): void => {
        if (!this.drag || event.pointerId !== this.drag.pointerId || !this.graph)
            return;
        const rect = this.graph.getBoundingClientRect();
        const x = (event.clientX - rect.left) * 320 / rect.width;
        const y = (event.clientY - rect.top) * 240 / rect.height;
        this.setPoint(this.drag.point, (x - 28) / 264, (166 - y) / 138, event, false);
    }
    private endHandle = (event: PointerEvent): void => {
        if (!this.drag || event.pointerId !== this.drag.pointerId)
            return;
        const point = this.drag.point;
        this.drag = undefined;
        const curve = this.curve();
        this.setPoint(point, point === 1 ? curve.x1 : curve.x2, point === 1 ? curve.y1 : curve.y2, event, true);
    }
    private keyHandle(point: 1 | 2, event: KeyboardEvent): void {
        const amount = event.shiftKey ? .1 : .01;
        const curve = this.curve();
        let x = point === 1 ? curve.x1 : curve.x2, y = point === 1 ? curve.y1 : curve.y2;
        if (event.key === 'ArrowLeft')
            x -= amount;
        else if (event.key === 'ArrowRight')
            x += amount;
        else if (event.key === 'ArrowUp')
            y += amount;
        else if (event.key === 'ArrowDown')
            y -= amount;
        else
            return;
        event.preventDefault();
        this.setPoint(point, x, y, event);
    }
    private point(x: number, y: number): {
        readonly x: number;
        readonly y: number;
    } { return { x: 28 + x * 264, y: 166 - y * 138 }; }
}
export { BezierBase };
export type { BezierProps, BezierValue } from './BezierBase.js';

register('cb-bezier', Bezier)
