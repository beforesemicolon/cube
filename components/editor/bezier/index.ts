import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { aria } from '../../core/accessibility.js'
import { actionLabel, createIconButton } from '../../action/create.js';
import type { Button } from '../../action/button/index.js';
import { finite } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { BezierBase, type BezierValue } from './BezierBase.js';
const css = editorCSS + `
:host{display:block;inline-size:min(100%,var(--component-bezier-width,560px));container-type:inline-size}
[part~=root]{display:grid;gap:var(--spacing-md,12px);padding:var(--spacing-md,12px);border:1px solid ${v('--color-separator')};border-radius:var(--radius-lg,12px);background:${v('--color-surface')}}
[part~=header]{display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-sm,8px)}
[part~=label]{font-weight:650}
[part~=actions]{display:flex;gap:var(--spacing-xs,4px)}
[part~=workspace]{display:grid;grid-template-columns:minmax(220px,1fr) minmax(150px,.55fr);gap:var(--spacing-md,12px);align-items:stretch}
[part~=graph]{inline-size:100%;min-block-size:240px;border:1px solid ${v('--color-separator')};border-radius:var(--radius-md,10px);background:${v('--color-surface-muted')};touch-action:none}
[part~=grid-line]{stroke:${v('--color-separator')};stroke-width:1}
[part~=axis]{stroke:${v('--color-border')};stroke-width:1.25}
[part~=handle-line]{stroke:${v('--color-muted-foreground')};stroke-width:1.25;stroke-dasharray:4 3}
[part~=curve]{fill:none;stroke:${v('--color-primary')};stroke-width:3;stroke-linecap:round}
[part~=handle]{fill:${v('--color-surface-raised')};stroke:${v('--color-primary')};stroke-width:2;cursor:grab;outline:none}
[part~=handle]:focus{stroke:${v('--color-focus')};stroke-width:4}
[part~=fields]{display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm,8px);align-content:start}
[part~=field]{display:grid;gap:var(--spacing-xs,4px);inline-size:100%;min-inline-size:0}[part~=field-label]{color:${v('--color-muted-foreground')};font-size:var(--component-caption-font-size,11px);font-weight:600}[part~=field-control]{display:block;inline-size:100%;min-inline-size:0;--component-studio-control-width:100%}
[part~=value]{grid-column:1/-1;display:block;overflow:auto;padding:var(--spacing-sm,8px);border:1px solid ${v('--color-separator')};border-radius:var(--radius-sm,6px);background:${v('--color-surface-muted')};font:var(--component-code-font,11px/1.5 ui-monospace,monospace);white-space:nowrap}
[part~=preview]{position:relative;grid-column:1/-1;block-size:56px;overflow:hidden;border:1px solid ${v('--color-separator')};border-radius:var(--radius-md,10px);background:linear-gradient(90deg,${v('--color-surface-muted')} 50%,${v('--color-surface')} 50%)}
[part~=preview-dot]{position:absolute;inset-inline-start:8px;inset-block-start:50%;inline-size:18px;block-size:18px;translate:0 -50%;border-radius:50%;background:${v('--color-primary')};box-shadow:0 2px 8px color-mix(in srgb,${v('--color-primary')} 45%,transparent)}
[part~=preview][data-playing] [part~=preview-dot]{animation:cb-bezier-preview var(--cb-duration) var(--cb-easing) both}
@keyframes cb-bezier-preview{to{inset-inline-start:calc(100% - 26px)}}
:host([data-disabled]) [part~=root]{opacity:var(--component-disabled-opacity,.5)}
@container(max-width:460px){[part~=workspace]{grid-template-columns:1fr}[part~=graph]{min-block-size:210px}}
`;
interface NumberControl extends HTMLElement {
    label: string;
    accessibleLabel: string;
    value: number;
    min: number;
    max: number;
    step: number;
    disabled: boolean;
}
interface NumberField {
    readonly wrapper: HTMLElement;
    readonly label: HTMLElement;
    readonly control: NumberControl;
}
interface DragState {
    readonly point: 1 | 2;
    readonly pointerId: number;
    readonly handle: SVGCircleElement;
}
const svgNS = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(name: K, part: string): SVGElementTagNameMap[K] {
    const node = document.createElementNS(svgNS, name);
    node.setAttribute('part', part);
    return node;
}
export class Bezier extends BezierBase {
    private labelNode?: HTMLElement;
    private graph?: SVGSVGElement;
    private curvePath?: SVGPathElement;
    private line1?: SVGLineElement;
    private line2?: SVGLineElement;
    private handle1?: SVGCircleElement;
    private handle2?: SVGCircleElement;
    private fields: readonly NumberControl[] = [];
    private fieldLabels: readonly HTMLElement[] = [];
    private valueNode?: HTMLOutputElement;
    private preview?: HTMLElement;
    private playButton?: Button;
    private resetButton?: Button;
    private drag?: DragState;
    render(): Template {
        const root = element('section', { attributes: { part: 'root editor' } }) as HTMLElement;
        const header = element('header', { attributes: { part: 'header' } }) as HTMLElement;
        this.labelNode = element('span', { attributes: { part: 'label' } }) as HTMLSpanElement;
        const actions = element('div', { attributes: { part: 'actions' } }) as HTMLDivElement;
        this.playButton = createIconButton('play', 'play', event => this.setPlaying(!this.playing, event));
        this.resetButton = createIconButton('reset', 'reset', event => this.reset(event));
        actions.append(this.playButton, this.resetButton);
        header.append(this.labelNode, actions);
        const workspace = element('div', { attributes: { part: 'workspace' } }) as HTMLDivElement;
        this.graph = svg('svg', 'graph control');
        this.graph.setAttribute('viewBox', '0 0 320 240');
        this.graph.setAttribute('role', 'group');
        this.graph.tabIndex = 0;
        for (let index = 0; index <= 4; index += 1) {
            const vertical = svg('line', 'grid-line');
            vertical.setAttribute('x1', String(28 + index * 66));
            vertical.setAttribute('x2', String(28 + index * 66));
            vertical.setAttribute('y1', '28');
            vertical.setAttribute('y2', '212');
            const horizontal = svg('line', 'grid-line');
            horizontal.setAttribute('x1', '28');
            horizontal.setAttribute('x2', '292');
            horizontal.setAttribute('y1', String(28 + index * 46));
            horizontal.setAttribute('y2', String(28 + index * 46));
            this.graph.append(vertical, horizontal);
        }
        const xAxis = svg('line', 'axis');
        xAxis.setAttribute('x1', '28');
        xAxis.setAttribute('x2', '292');
        xAxis.setAttribute('y1', '166');
        xAxis.setAttribute('y2', '166');
        const yAxis = svg('line', 'axis');
        yAxis.setAttribute('x1', '28');
        yAxis.setAttribute('x2', '28');
        yAxis.setAttribute('y1', '28');
        yAxis.setAttribute('y2', '212');
        this.line1 = svg('line', 'handle-line');
        this.line2 = svg('line', 'handle-line');
        this.curvePath = svg('path', 'curve');
        this.handle1 = this.createHandle(1);
        this.handle2 = this.createHandle(2);
        this.graph.append(xAxis, yAxis, this.line1, this.line2, this.curvePath, this.handle1, this.handle2);
        const fields = element('div', { attributes: { part: 'fields' } }) as HTMLDivElement;
        const numberFields = [this.createField(1, 'x'), this.createField(1, 'y'), this.createField(2, 'x'), this.createField(2, 'y')];
        this.fields = numberFields.map(field => field.control);
        this.fieldLabels = numberFields.map(field => field.label);
        this.valueNode = element('output', { attributes: { part: 'value' } }) as HTMLOutputElement;
        this.valueNode.tabIndex = 0;
        this.preview = element('div', { attributes: { part: 'preview' } }) as HTMLDivElement;
        this.preview.setAttribute('role', 'img');
        this.preview.append(element('span', { attributes: { part: 'preview-dot' } }) as HTMLSpanElement);
        fields.append(...numberFields.map(field => field.wrapper), this.valueNode, this.preview);
        workspace.append(this.graph, fields);
        root.append(header, workspace);
        this.graph.addEventListener('pointermove', event => this.moveHandle(event));
        this.graph.addEventListener('pointerup', event => this.endHandle(event));
        this.graph.addEventListener('pointercancel', event => this.endHandle(event));
        return html`<style part="styles">${css}</style>${root}`;
    }
    protected syncView(): void {
        if (!this.labelNode || !this.graph || !this.curvePath || !this.line1 || !this.line2 || !this.handle1 || !this.handle2 || !this.valueNode || !this.preview || !this.playButton || !this.resetButton || this.fields.length !== 4 || this.fieldLabels.length !== 4)
            return;
        const curve = this.curve();
        this.labelNode.textContent = this.displayLabel();
        this.labelNode.hidden = !this.displayLabel();
        const start = this.point(0, 0), end = this.point(1, 1), first = this.point(curve.x1, curve.y1), second = this.point(curve.x2, curve.y2);
        this.curvePath.setAttribute('d', `M${start.x} ${start.y} C${first.x} ${first.y} ${second.x} ${second.y} ${end.x} ${end.y}`);
        this.positionLine(this.line1, start, first);
        this.positionLine(this.line2, end, second);
        this.positionHandle(this.handle1, first);
        this.positionHandle(this.handle2, second);
        const values = [curve.x1, curve.y1, curve.x2, curve.y2];
        const labels = [this.text('x1Label'), this.text('y1Label'), this.text('x2Label'), this.text('y2Label')];
        this.fields.forEach((field, index) => {
            const label = labels[index]!;
            this.fieldLabels[index]!.textContent = label;
            this.fieldLabels[index]!.hidden = !label;
            field.value = values[index]!;
            field.label = '';
            field.accessibleLabel = label;
            field.disabled = this.unavailable;
        });
        const value = this.cssValue(curve);
        this.value = value;
        this.valueNode.value = value;
        this.graph.setAttribute('aria-label', this.text('curveLabel') || this.accessibleName());
        aria(this.graph, 'aria-disabled', this.unavailable ? true : null);
        this.graph.tabIndex = this.unavailable ? -1 : 0;
        this.preview.setAttribute('aria-label', this.text('previewLabel'));
        this.preview.style.setProperty('--cb-duration', `${Math.max(50, finite(this.duration, 1000))}ms`);
        this.preview.style.setProperty('--cb-easing', value);
        this.preview.toggleAttribute('data-playing', this.playing);
        actionLabel(this.playButton, this.playing ? this.text('pauseLabel') : this.text('playLabel'));
        this.playButton.icon = this.playing ? 'pause' : 'play';
        this.playButton.disabled = this.unavailable;
        actionLabel(this.resetButton, this.text('resetLabel'));
        this.resetButton.disabled = this.unavailable;
    }
    private createField(point: 1 | 2, axis: 'x' | 'y'): NumberField {
        const wrapper = element('label', { attributes: { part: `field point-${point}-${axis}` } }) as HTMLLabelElement;
        const label = element('span', { attributes: { part: 'field-label' } }) as HTMLSpanElement;
        const control = document.createElement('cb-number-input') as NumberControl;
        control.setAttribute('part', `field-control point-${point}-${axis}-control`);
        control.min = axis === 'x' ? 0 : -1;
        control.max = axis === 'x' ? 1 : 2;
        control.step = .01;
        control.addEventListener('change', event => {
            event.stopPropagation();
            const value = Number((event as CustomEvent<{
                value: string | number;
            }>).detail.value);
            const curve = this.curve();
            const x = axis === 'x' ? value : point === 1 ? curve.x1 : curve.x2;
            const y = axis === 'y' ? value : point === 1 ? curve.y1 : curve.y2;
            this.setPoint(point, x, y, event);
        });
        wrapper.addEventListener('click', event => { if (event.target === label)
            control.focus(); });
        wrapper.append(label, control);
        return { wrapper, label, control };
    }
    private createHandle(point: 1 | 2): SVGCircleElement {
        const handle = svg('circle', `handle handle-${point}`);
        handle.setAttribute('r', '7');
        handle.setAttribute('role', 'slider');
        handle.tabIndex = 0;
        handle.addEventListener('pointerdown', event => {
            if (this.unavailable)
                return;
            this.drag = { point, pointerId: event.pointerId, handle };
            handle.setPointerCapture(event.pointerId);
        });
        handle.addEventListener('keydown', event => this.keyHandle(point, event));
        return handle;
    }
    private moveHandle(event: PointerEvent): void {
        if (!this.drag || event.pointerId !== this.drag.pointerId || !this.graph)
            return;
        const rect = this.graph.getBoundingClientRect();
        const x = (event.clientX - rect.left) * 320 / rect.width;
        const y = (event.clientY - rect.top) * 240 / rect.height;
        this.setPoint(this.drag.point, (x - 28) / 264, (166 - y) / 138, event, false);
    }
    private endHandle(event: PointerEvent): void {
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
    private positionLine(line: SVGLineElement, from: {
        readonly x: number;
        readonly y: number;
    }, to: {
        readonly x: number;
        readonly y: number;
    }): void {
        line.setAttribute('x1', String(from.x));
        line.setAttribute('y1', String(from.y));
        line.setAttribute('x2', String(to.x));
        line.setAttribute('y2', String(to.y));
    }
    private positionHandle(handle: SVGCircleElement, point: {
        readonly x: number;
        readonly y: number;
    }): void {
        handle.setAttribute('cx', String(point.x));
        handle.setAttribute('cy', String(point.y));
        const curve = this.curve(), first = handle === this.handle1;
        const x = first ? curve.x1 : curve.x2, y = first ? curve.y1 : curve.y2;
        handle.setAttribute('aria-valuetext', `${Math.round(x * 100) / 100}, ${Math.round(y * 100) / 100}`);
        handle.setAttribute('aria-valuemin', '-1');
        handle.setAttribute('aria-valuemax', '2');
        handle.setAttribute('aria-valuenow', String(y));
        handle.setAttribute('aria-label', first ? `${this.text('x1Label')}, ${this.text('y1Label')}` : `${this.text('x2Label')}, ${this.text('y2Label')}`);
    }
}
export { BezierBase };
export type { BezierProps, BezierValue } from './BezierBase.js';
