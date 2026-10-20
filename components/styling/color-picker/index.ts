import componentStylesheet from './styles.css?inline'
import { elementRefs } from '../../core/refs.js'
import { when, is, isNot, and, or, pick, type Template, html, repeat, state } from '../../core/runtime.js'

import { uid } from '../../core/id.js';

import { PopupController } from '../../core/popup.js';
import { bool, clamp, finite, text } from '../../core/value.js';

import { ColorPickerBase } from './ColorPickerBase.js';
import { colorToHex, hsvaToRgba, parseHexColor, rgbaToHsva, type HSVAColor } from './color.js';

type ChannelName = 'hue' | 'saturation' | 'value' | 'alpha' | 'red' | 'green' | 'blue';
interface ColorSamplerResult {
    readonly sRGBHex: string;
}
interface ColorSampler {
    open(): Promise<ColorSamplerResult>;
}
interface ColorSamplerConstructor {
    new (): ColorSampler;
}
type ColorSamplerWindow = Window & {
    EyeDropper?: ColorSamplerConstructor;
};
interface ChannelDefinition {
    readonly name: ChannelName;
    readonly min: number;
    readonly max: number;
    readonly step: number;
}
const channels: readonly ChannelDefinition[] = [
    { name: 'hue', min: 0, max: 360, step: 1 }, { name: 'saturation', min: 0, max: 100, step: 1 },
    { name: 'value', min: 0, max: 100, step: 1 }, { name: 'alpha', min: 0, max: 100, step: 1 },
    { name: 'red', min: 0, max: 255, step: 1 }, { name: 'green', min: 0, max: 255, step: 1 },
    { name: 'blue', min: 0, max: 255, step: 1 },
];
export class ColorPicker extends ColorPickerBase {
    stylesheet = componentStylesheet

    private readonly pickerId=uid('cb-color-picker');
    private readonly hexDraft=state<string|null>(null);
    private node(name: string): HTMLElement | undefined { const node=this.refs[name]?.[0]; return node instanceof HTMLElement ? node : undefined; }
    private get trigger(): HTMLElement | undefined { return this.node('trigger'); }
    private get popup(): HTMLElement | undefined { return this.node('popup'); }
    private get plane(): HTMLElement | undefined { return this.node('plane'); }
    private get nativeControl(): HTMLInputElement | undefined { const node=this.node('native'); return node instanceof HTMLInputElement ? node : undefined; }
    private get hueSlider(): HTMLInputElement | undefined { const node=this.node('hue'); return node instanceof HTMLInputElement ? node : undefined; }
    private get alphaSlider(): HTMLInputElement | undefined { const node=this.node('alpha'); return node instanceof HTMLInputElement ? node : undefined; }
    private get hexInput(): HTMLInputElement | undefined { const node=this.node('hex'); return node instanceof HTMLInputElement ? node : undefined; }
    private get paletteNode(): HTMLElement | undefined { return this.node('palette'); }
    private get addSwatchButton(): HTMLElement | undefined { return this.node('addSwatch'); }
    private popupController?: PopupController;
    private validationError(): boolean { return Boolean(this.validationMessage) && (this.validationShown || Boolean(text(this.errorText))); }
    private descriptionText = (): string | null => { return [text(this.description),this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null; }
    private readonly channelLabel = (name: ChannelName): string => ({
        hue:this.hueLabel,saturation:this.saturationLabel,value:this.valueLabel,alpha:this.alphaLabel,red:this.redLabel,green:this.greenLabel,blue:this.blueLabel
    })[name];
    private channelValue(name: ChannelName): number {
        const color=this.color(),rgba=hsvaToRgba(color);
        return {hue:Math.round(color.hue),saturation:Math.round(color.saturation),value:Math.round(color.value),alpha:Math.round(color.alpha*100),red:rgba.red,green:rgba.green,blue:rgba.blue}[name];
    }
    private paletteColors = (): readonly string[] => { return [...(bool(this.allowAlpha) ? ['#00000000'] : []),...this.palette()].filter((color,index,colors) => colors.indexOf(color)===index); }
    private removable(color: string): boolean { return color !== '#00000000' && this.palette().includes(color); }
    render(): Template {
        const blocked = or(() => this.unavailable, this.props.readOnly);
        const channelFields=(rgb: boolean): Template => html`${repeat(() => channels.filter(channel => ['red','green','blue'].includes(channel.name) === rgb), definition => html`
            <label part=${`channel-field ${definition.name}-field`} hidden=${and(is(definition.name, 'alpha'), isNot(this.props.allowAlpha))}>
                <span part="channel-label">${() => this.channelLabel(definition.name)}</span>
                <input part=${`channel-input ${definition.name}-input control`} type="number" min=${definition.min} max=${definition.max} step=${definition.step} inputmode="decimal"
                    aria-label=${() => this.channelLabel(definition.name)} value=${() => this.channelValue(definition.name)} disabled=${blocked}
                    oninput=${(event: Event) => { if(event.currentTarget instanceof HTMLInputElement) this.updateFromChannel(definition.name,event.currentTarget.valueAsNumber,false,event); }}>
            </label>`,{key:definition=>definition.name})}`;
        return html`<div part="root">
            <cb-button part="trigger control" exportparts="control:trigger-control,label:trigger-label,button-label:trigger-label,icon:trigger-icon,description:trigger-description,control:control-control,label:control-label,button-label:control-label,icon:control-icon,description:control-description" ref="trigger" data-bare data-semantic-host id=${this.pickerId}
                disabled=${blocked} hidden=${this.props.native} accessible-label=${this.accessibleName}
                aria-haspopup="dialog" aria-controls=${`${this.pickerId}-popup`} aria-expanded=${when(and(this.props.open, isNot(this.props.native)), 'true', 'false')}
                aria-description=${this.descriptionText} aria-invalid=${() => this.validationError() || null}
                onaction=${(event: Event) => { event.stopPropagation(); this.setOpen(!bool(this.open),event); }}>
                <span part="trigger-swatch" style=${() => `--cb-selected-color:${colorToHex(this.color())}`}></span>
            </cb-button>
            <input part="native control" ref="native" type="color" id=${`${this.pickerId}-native`}
                value=${() => colorToHex(this.color(),false)} disabled=${blocked} required=${and(this.props.required, isNot(this.props.readOnly))}
                hidden=${isNot(this.props.native)} aria-label=${this.accessibleName} aria-description=${this.descriptionText} aria-invalid=${() => this.validationError() || null}
                oninput=${(event: Event) => { const color=parseHexColor(this.nativeControl?.value ?? ''); if(color) this.changeColor(color,event); }}
                onblur=${() => { this.validationShown=true; }}>
            <section part="popup" ref="popup" id=${`${this.pickerId}-popup`} role="dialog" tabindex="-1" hidden aria-label=${this.accessibleName}
                style=${() => { const color=this.color(); return `--cb-hue-color:hsl(${color.hue},100%,50%);--cb-solid-color:${colorToHex({...color,alpha:1},false)};--cb-saturation-position:${color.saturation}%;--cb-value-position:${100-color.value}%`; }}>
                <cb-button part="plane" exportparts="control:plane-control,label:plane-label,button-label:plane-label,icon:plane-icon,description:plane-description" ref="plane" data-bare data-semantic-host accessible-label=${() => this.planeLabel || this.accessibleName()} disabled=${blocked}
                    onbeforeaction=${(event: Event) => event.stopPropagation()}
                    onaction=${(event: Event) => event.stopPropagation()}
                    onpointerdown=${(event: PointerEvent) => { if(blocked()) return; this.plane?.setPointerCapture(event.pointerId); this.updateFromPlane(event,false); }}
                    onpointermove=${(event: PointerEvent) => { if(this.plane?.hasPointerCapture(event.pointerId)) this.updateFromPlane(event,false); }}
                    onpointerup=${(event: PointerEvent) => { if(this.plane?.hasPointerCapture(event.pointerId)) { this.plane.releasePointerCapture(event.pointerId); this.updateFromPlane(event,true); } }}
                    onkeydown=${this.handlePlaneKey}><span part="marker"></span></cb-button>
                <div part="slider-field hue-slider-field"><input part="slider hue-slider control" ref="hue" type="range" min="0" max="360" step="1"
                    value=${() => Math.round(this.color().hue)} aria-label=${this.props.hueLabel} disabled=${blocked}
                    oninput=${(event: Event) => this.updateHue(false,event)}></div>
                <div part="slider-field alpha-slider-field" hidden=${isNot(this.props.allowAlpha)}>
                    <input part="slider alpha-slider control" ref="alpha" type="range" min="0" max="100" step="1"
                        value=${() => Math.round(this.color().alpha*100)} aria-label=${this.props.alphaLabel} disabled=${blocked}
                        oninput=${(event: Event) => this.updateAlpha(false,event)}></div>
                <div part="toolbar"><label part="hex-field"><span part="channel-label">${this.props.hexLabel}</span>
                    <input part="hex-input control" ref="hex" type="text" autocomplete="off" spellcheck="false" disabled=${blocked}
                        aria-label=${this.props.hexLabel} value=${() => this.hexDraft[0]() ?? colorToHex(this.color())}
                        oninput=${(event: Event) => { this.hexDraft[1](this.hexInput?.value ?? ''); this.updateFromHex(false,event); }}
                        onblur=${() => this.hexDraft[1](null)}></label>
                    <cb-button part="sampler" exportparts="control:sampler-control,label:sampler-label,button-label:sampler-label,icon:sampler-icon,description:sampler-description" icon-only icon="eye" variant="ghost" size="sm" accessible-label=${this.props.samplerLabel}
                        hidden=${or(isNot(this.props.allowSampler), isNot(this.props.samplerLabel), isNot(this.samplerAvailable))} disabled=${blocked}
                        onaction=${(event: Event) => { event.stopPropagation(); void this.sample(event); }}></cb-button>
                    <cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" icon-only icon="close" variant="ghost" size="sm" accessible-label=${this.props.closeLabel} hidden=${isNot(this.props.closeLabel)}
                        onaction=${(event: Event) => { event.stopPropagation(); if(this.setOpen(false,event)) this.trigger?.focus(); }}></cb-button>
                </div><div part="channels hsv-channels">${channelFields(false)}</div><div part="channels rgb-channels">${channelFields(true)}</div>
                <div part="palette-group" hidden=${and(isNot(pick(this.paletteColors, "length")), isNot(this.props.addSwatchLabel))}>
                    <span part="palette-label label" hidden=${isNot(this.props.swatchesLabel)}>${this.props.swatchesLabel}</span>
                    <div part="palette" ref="palette" role="group" aria-label=${() => this.swatchesLabel || null}>
                        ${repeat(this.paletteColors, color => html`<cb-button ref="swatches" part="swatch" exportparts="control:swatch-control,label:swatch-label,button-label:swatch-label,icon:swatch-icon,description:swatch-description" data-bare data-semantic-host data-color=${color}
                            aria-pressed=${when(() => color === this.normalizedValue(), 'true', 'false')} disabled=${blocked} data-removable=${() => this.removable(color) ? '' : null}
                            accessible-label=${() => { const label=color === '#00000000' ? this.transparentLabel || color : color; return this.swatchesLabel ? `${this.swatchesLabel}: ${label}` : label; }}
                            title=${() => color === '#00000000' ? this.transparentLabel || color : color}
                            aria-keyshortcuts=${() => this.removable(color) ? 'Delete Backspace' : null}
                            aria-description=${() => this.removable(color) && this.removeSwatchLabel ? this.removeSwatchLabel.replaceAll('{color}',color) : null}
                            onaction=${(event: Event) => { event.stopPropagation(); if(this.choose(color,event)) this.focusSwatch(color); }}
                            onkeydown=${(event: KeyboardEvent) => {
                                if(!['Delete','Backspace'].includes(event.key) || !this.removable(color)) return;
                                const index=this.paletteColors().indexOf(color);
                                if(this.removeSwatch(color,event)) { event.preventDefault(); queueMicrotask(() => this.focusPaletteItem(Math.max(0,index))); }
                            }}><span part="swatch-preview"><span part="swatch-color" style=${`--cb-swatch-color:${color}`}></span></span></cb-button>`,{key:color=>color})}
                        <cb-button part="add-swatch" exportparts="control:add-swatch-control,label:add-swatch-label,button-label:add-swatch-label,icon:add-swatch-icon,description:add-swatch-description" ref="addSwatch" icon-only icon="plus" variant="outline" size="sm"
                            accessible-label=${this.props.addSwatchLabel} hidden=${isNot(this.props.addSwatchLabel)} disabled=${blocked}
                            onpointerdown=${(event: PointerEvent) => event.preventDefault()}
                            onaction=${(event: Event) => { event.stopPropagation(); const value=this.normalizedValue(); if(this.addSwatch(value,event)) queueMicrotask(() => this.focusSwatch(value)); }}></cb-button>
                    </div></div>
            </section></div>`;
    }
    protected mount(): void {
        if(this.popup && this.trigger) this.popupController=new PopupController(this.popup,this.trigger,event=>this.setOpen(false,event),{maxWidth:()=>this.popupMaxWidth,maxHeight:()=>this.popupMaxHeight});
        super.mount();
    }
    protected unmount(): void { this.popupController?.dispose(); this.popupController=undefined; }
    protected fieldElement(): HTMLInputElement | undefined { return this.nativeControl; }
    protected syncView(): void {
        const value=colorToHex(this.color());
        this.value=value;
        this.toggleAttribute('data-invalid',this.validationError()); this.toggleAttribute('data-native',bool(this.native));
        if(bool(this.native)) { this.open=false; this.removeAttribute('open'); this.popupController?.hide(); }
        else if(bool(this.open)) this.popupController?.show(); else this.popupController?.hide();
        this.syncForm(value);
    }
    focus(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.trigger)?.focus(options); }
    focusEditor(options?: FocusOptions): void { (bool(this.native) ? this.nativeControl : this.hexInput)?.focus(options); }
    private updateFromPlane(event: PointerEvent, commit: boolean): void {
        if (!this.plane)
            return;
        const bounds = this.plane.getBoundingClientRect();
        const saturation = clamp((event.clientX - bounds.left) / Math.max(1, bounds.width) * 100, 0, 100);
        const value = 100 - clamp((event.clientY - bounds.top) / Math.max(1, bounds.height) * 100, 0, 100);
        const next = { ...this.color(), saturation, value };
        if (commit)
            this.changeColor(next, event);
        else
            this.inputColor(next, event);
    }
    private handlePlaneKey = (event: KeyboardEvent): void => {
        const amount = event.shiftKey ? 10 : 1, color = this.color();
        let next: HSVAColor | null = null;
        if (event.key === 'ArrowLeft')
            next = { ...color, saturation: clamp(color.saturation - amount, 0, 100) };
        else if (event.key === 'ArrowRight')
            next = { ...color, saturation: clamp(color.saturation + amount, 0, 100) };
        else if (event.key === 'ArrowUp')
            next = { ...color, value: clamp(color.value + amount, 0, 100) };
        else if (event.key === 'ArrowDown')
            next = { ...color, value: clamp(color.value - amount, 0, 100) };
        if (next) {
            event.preventDefault();
            this.changeColor(next, event);
        }
    }
    private updateHue(commit: boolean, event: Event): void {
        const next = { ...this.color(), hue: clamp(finite(this.hueSlider?.valueAsNumber), 0, 360) };
        if (commit)
            this.changeColor(next, event);
        else
            this.inputColor(next, event);
    }
    private updateAlpha(commit: boolean, event: Event): void {
        const next = { ...this.color(), alpha: clamp(finite(this.alphaSlider?.valueAsNumber), 0, 100) / 100 };
        if (commit)
            this.changeColor(next, event);
        else
            this.inputColor(next, event);
    }
    private updateFromHex(commit: boolean, event: Event): void {
        const color = parseHexColor(this.hexInput?.value ?? '');
        if (!color)
            return;
        if (commit)
            this.changeColor(color, event);
        else
            this.inputColor(color, event);
    }
    private updateFromChannel(name: ChannelName, source: number, commit: boolean, event: Event): void {
        if (!Number.isFinite(source))
            return;
        const color = this.color(), rgba = hsvaToRgba(color);
        let next: HSVAColor;
        if (name === 'hue')
            next = { ...color, hue: clamp(source, 0, 360) };
        else if (name === 'saturation')
            next = { ...color, saturation: clamp(source, 0, 100) };
        else if (name === 'value')
            next = { ...color, value: clamp(source, 0, 100) };
        else if (name === 'alpha')
            next = { ...color, alpha: clamp(source, 0, 100) / 100 };
        else
            next = rgbaToHsva({ ...rgba, [name]: clamp(source, 0, 255) });
        if (commit)
            this.changeColor(next, event);
        else
            this.inputColor(next, event);
    }
    private focusSwatch(color: string): void {
        const normalized = colorToHex(parseHexColor(color) ?? this.color());
        elementRefs(this.refs.swatches)
            .find(button => button.dataset.color === normalized)?.focus();
    }
    private focusPaletteItem(index: number): void {
        const buttons = elementRefs(this.refs.swatches);
        const button = buttons[Math.min(index, Math.max(0, buttons.length - 1))];
        if (button)
            button.focus();
        else if (!this.addSwatchButton?.hidden)
            this.addSwatchButton?.focus();
    }
    private samplerAvailable = (): boolean => { return typeof (this.ownerDocument.defaultView as ColorSamplerWindow | null)?.EyeDropper === 'function'; }
    private async sample(originalEvent: Event): Promise<void> {
        const Sampler = (this.ownerDocument.defaultView as ColorSamplerWindow | null)?.EyeDropper;
        if (!Sampler || !bool(this.allowSampler))
            return;
        try {
            const result = await new Sampler().open();
            this.choose(result.sRGBHex, originalEvent);
        }
        catch {
            // The browser rejects when the user cancels; cancellation is not a component error.
        }
    }
}
export { ColorPickerBase };
export type { ColorPickerChangeDetail, ColorPickerProps, ColorPickerSwatchDetail } from './ColorPickerBase.js';
export { colorToHex, hsvaToRgba, normalizeColor, parseHexColor, rgbaToHsva } from './color.js';
export type { HSVAColor, RGBAColor } from './color.js';
