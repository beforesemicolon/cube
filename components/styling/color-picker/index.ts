import { type Template, html, repeat, state } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { uid } from '../../core/id.js';
import type { Button } from '../../action/button/index.js';
import { PopupController } from '../../core/popup.js';
import { bool, clamp, finite, text } from '../../core/value.js';
import { token as v } from '../../theme/tokens.js';
import { ColorPickerBase } from './ColorPickerBase.js';
import { colorToHex, hsvaToRgba, parseHexColor, rgbaToHsva, type HSVAColor } from './color.js';
const css = editorCSS + `
:host{display:inline-block;inline-size:auto;min-inline-size:0}
[part~=root]{display:grid;gap:var(--spacing-xs,4px);justify-items:start;min-inline-size:0}
[part~=trigger],[part~=native]{position:relative;display:block;inline-size:var(--component-color-picker-trigger-size,36px);min-inline-size:var(--component-color-picker-trigger-size,36px);block-size:var(--component-color-picker-trigger-size,36px);min-block-size:var(--component-color-picker-trigger-size,36px);padding:3px;overflow:hidden;border:1px solid ${v('--color-border')};border-radius:var(--component-color-picker-radius,var(--radius-sm));background:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/10px 10px}
[part~=trigger]:hover:not(:disabled){border-color:${v('--color-primary')};background:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/10px 10px}
[part~=trigger-swatch]{display:block;inline-size:100%;block-size:100%;border-radius:calc(var(--component-color-picker-radius,var(--radius-sm)) - 3px);background:var(--cb-selected-color)}
[part~=trigger]::part(control),[part~=trigger]::part(button-label),[part~=plane]::part(control),[part~=plane]::part(button-label),[part~=swatch]::part(control),[part~=swatch]::part(button-label){display:block;inline-size:100%;block-size:100%}
[part~=trigger]::part(button-label),[part~=plane]::part(button-label),[part~=swatch]::part(button-label){overflow:visible}
[part~=native]{appearance:auto;color-scheme:inherit;cursor:pointer}
[part~=native]::-webkit-color-swatch-wrapper{padding:0}[part~=native]::-webkit-color-swatch{border:0;border-radius:calc(var(--component-color-picker-radius,var(--radius-sm)) - 3px)}
[part~=popup]{z-index:var(--z-index-popover,1000);container-type:inline-size;display:grid;gap:var(--spacing-md,12px);inline-size:min(var(--component-color-picker-popup-width,344px),calc(100vw - 16px));box-sizing:border-box;padding:var(--spacing-md,12px);overflow:auto;border:1px solid ${v('--color-border')};border-radius:var(--radius-lg,12px);background:${v('--color-surface-raised')};color:${v('--color-foreground')};box-shadow:var(--shadow-lg,0 18px 50px color-mix(in srgb,${v('--color-foreground')} 22%,transparent))}
[part~=toolbar]{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:end;gap:var(--spacing-sm,8px)}
[part~=swatch-preview]{position:relative;overflow:hidden;background:conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/8px 8px}
[part~=swatch-color]{position:absolute;inset:0;background:var(--cb-swatch-color)}
[part~=hex-field],[part~=channel-field]{display:grid;gap:2px;min-inline-size:0}
[part~=channel-label]{color:${v('--color-muted-foreground')};font-size:10px;font-weight:600;letter-spacing:.04em}
[part~=hex-input],[part~=channel-input]{inline-size:100%;min-inline-size:0;min-block-size:32px;padding:4px 8px;border:1px solid ${v('--color-border')};border-radius:var(--radius-sm);background:${v('--color-surface-muted')};font-variant-numeric:tabular-nums}
[part~=plane]{position:relative;inline-size:100%;block-size:var(--component-color-picker-plane-height,184px);min-block-size:144px;padding:0;overflow:hidden;border:1px solid ${v('--color-border')};border-radius:var(--radius-md);background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,var(--cb-hue-color));cursor:crosshair;touch-action:none}
button[part~=plane]:hover:not(:disabled),button[part~=plane]:active:not(:disabled){background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,var(--cb-hue-color))}
[part~=marker]{position:absolute;inset-block-start:calc(var(--cb-value-position) - 8px);inset-inline-start:calc(var(--cb-saturation-position) - 8px);inline-size:16px;block-size:16px;border:2px solid #fff;border-radius:50%;background:transparent;box-shadow:0 0 0 1px #000,0 1px 4px rgba(0,0,0,.5);pointer-events:none}
[part~=slider-field]{display:block;min-inline-size:0}
[part~=slider]{appearance:none;inline-size:100%;block-size:14px;min-block-size:14px;padding:0;border:1px solid ${v('--color-border')};border-radius:999px;background:transparent;cursor:pointer}
[part~=hue-slider]{background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)}
[part~=alpha-slider]{background:linear-gradient(90deg,transparent,var(--cb-solid-color)),conic-gradient(${v('--color-separator')} 25%,${v('--color-surface')} 0 50%,${v('--color-separator')} 0 75%,${v('--color-surface')} 0) 0 0/8px 8px}
[part~=slider]::-webkit-slider-thumb{appearance:none;inline-size:18px;block-size:18px;border:2px solid #fff;border-radius:50%;background:${v('--color-surface')};box-shadow:0 0 0 1px color-mix(in srgb,${v('--color-foreground')} 65%,transparent),0 1px 3px rgba(0,0,0,.35)}
[part~=slider]::-moz-range-thumb{inline-size:16px;block-size:16px;border:2px solid #fff;border-radius:50%;background:${v('--color-surface')};box-shadow:0 0 0 1px color-mix(in srgb,${v('--color-foreground')} 65%,transparent)}
[part~=channels]{display:grid;gap:var(--spacing-sm,8px)}
[part~=hsv-channels]{grid-template-columns:repeat(4,minmax(0,1fr))}
[part~=rgb-channels]{grid-template-columns:repeat(3,minmax(0,1fr))}
[part~=palette-group]{display:grid;gap:var(--spacing-xs,4px)}
[part~=palette]{display:flex;flex-wrap:wrap;gap:var(--spacing-xs,4px)}
[part~=swatch]{position:relative;inline-size:28px;min-inline-size:28px;block-size:28px;min-block-size:28px;padding:2px;border:1px solid ${v('--color-border')};border-radius:var(--radius-sm);background:${v('--color-surface')};overflow:hidden}
[part~=swatch][aria-pressed=true]{border-color:${v('--color-primary')};box-shadow:0 0 0 1px ${v('--color-primary')}}
[part~=swatch-preview]{display:block;inline-size:100%;block-size:100%;border-radius:calc(var(--radius-sm) - 2px)}
[part~=add-swatch]::part(control){border-style:dashed}
:host([data-invalid]) [part~=trigger],:host([data-invalid]) [part~=native]{border-color:${v('--color-danger')}}
@container(max-width:300px){[part~=hsv-channels]{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(pointer:coarse){[part~=trigger],[part~=native]{--component-color-picker-trigger-size:44px}[part~=swatch]{inline-size:36px;min-inline-size:36px;block-size:36px;min-block-size:36px}[part~=add-swatch]{--component-control-height-sm:36px}}
`;
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
    private descriptionText(): string | null { return [text(this.description),this.validationError() ? this.validationMessage : ''].filter(Boolean).join(' ') || null; }
    private readonly channelLabel = (name: ChannelName): string => ({
        hue:this.hueLabel,saturation:this.saturationLabel,value:this.valueLabel,alpha:this.alphaLabel,red:this.redLabel,green:this.greenLabel,blue:this.blueLabel
    })[name];
    private channelValue(name: ChannelName): number {
        const color=this.color(),rgba=hsvaToRgba(color);
        return {hue:Math.round(color.hue),saturation:Math.round(color.saturation),value:Math.round(color.value),alpha:Math.round(color.alpha*100),red:rgba.red,green:rgba.green,blue:rgba.blue}[name];
    }
    private paletteColors(): readonly string[] { return [...(bool(this.allowAlpha) ? ['#00000000'] : []),...this.palette()].filter((color,index,colors) => colors.indexOf(color)===index); }
    private removable(color: string): boolean { return color !== '#00000000' && this.palette().includes(color); }
    render(): Template {
        const blocked=(): boolean => this.unavailable || bool(this.readOnly);
        const channelFields=(rgb: boolean): Template => html`${repeat(() => channels.filter(channel => ['red','green','blue'].includes(channel.name) === rgb), definition => html`
            <label part=${`channel-field ${definition.name}-field`} hidden=${() => definition.name === 'alpha' && !bool(this.allowAlpha)}>
                <span part="channel-label">${() => this.channelLabel(definition.name)}</span>
                <input part=${`channel-input ${definition.name}-input control`} type="number" min=${definition.min} max=${definition.max} step=${definition.step} inputmode="decimal"
                    aria-label=${() => this.channelLabel(definition.name)} value=${() => this.channelValue(definition.name)} disabled=${blocked}
                    oninput=${(event: Event) => { if(event.currentTarget instanceof HTMLInputElement) this.updateFromChannel(definition.name,event.currentTarget.valueAsNumber,false,event); }}>
            </label>`,{key:definition=>definition.name})}`;
        return html`<style part="styles">${css}</style><div part="root">
            <cb-button part="trigger control" exportparts="control:trigger-control,label:trigger-label,button-label:trigger-label,icon:trigger-icon,description:trigger-description,control:control-control,label:control-label,button-label:control-label,icon:control-icon,description:control-description" ref="trigger" data-bare data-semantic-host id=${this.pickerId}
                disabled=${blocked} hidden=${() => bool(this.native)} accessible-label=${() => this.accessibleName()}
                aria-haspopup="dialog" aria-controls=${`${this.pickerId}-popup`} aria-expanded=${() => bool(this.open) && !bool(this.native)}
                aria-description=${() => this.descriptionText()} aria-invalid=${() => this.validationError() || null}
                onaction=${(event: Event) => { event.stopPropagation(); this.setOpen(!bool(this.open),event); }}>
                <span part="trigger-swatch" style=${() => `--cb-selected-color:${colorToHex(this.color())}`}></span>
            </cb-button>
            <input part="native control" ref="native" type="color" id=${`${this.pickerId}-native`}
                value=${() => colorToHex(this.color(),false)} disabled=${blocked} required=${() => bool(this.required) && !bool(this.readOnly)}
                hidden=${() => !bool(this.native)} aria-label=${() => this.accessibleName()} aria-description=${() => this.descriptionText()} aria-invalid=${() => this.validationError() || null}
                oninput=${(event: Event) => { const color=parseHexColor(this.nativeControl?.value ?? ''); if(color) this.changeColor(color,event); }}
                onblur=${() => { this.validationShown=true; }}>
            <section part="popup" ref="popup" id=${`${this.pickerId}-popup`} role="dialog" tabindex="-1" hidden aria-label=${() => this.accessibleName()}
                style=${() => { const color=this.color(); return `--cb-hue-color:hsl(${color.hue},100%,50%);--cb-solid-color:${colorToHex({...color,alpha:1},false)};--cb-saturation-position:${color.saturation}%;--cb-value-position:${100-color.value}%`; }}>
                <cb-button part="plane" exportparts="control:plane-control,label:plane-label,button-label:plane-label,icon:plane-icon,description:plane-description" ref="plane" data-bare data-semantic-host accessible-label=${() => this.planeLabel || this.accessibleName()} disabled=${blocked}
                    onpointerdown=${(event: PointerEvent) => { if(blocked()) return; this.plane?.setPointerCapture(event.pointerId); this.updateFromPlane(event,false); }}
                    onpointermove=${(event: PointerEvent) => { if(this.plane?.hasPointerCapture(event.pointerId)) this.updateFromPlane(event,false); }}
                    onpointerup=${(event: PointerEvent) => { if(this.plane?.hasPointerCapture(event.pointerId)) { this.plane.releasePointerCapture(event.pointerId); this.updateFromPlane(event,true); } }}
                    onkeydown=${(event: KeyboardEvent) => this.handlePlaneKey(event)}><span part="marker"></span></cb-button>
                <div part="slider-field hue-slider-field"><input part="slider hue-slider control" ref="hue" type="range" min="0" max="360" step="1"
                    value=${() => Math.round(this.color().hue)} aria-label=${() => this.hueLabel} disabled=${blocked}
                    oninput=${(event: Event) => this.updateHue(false,event)}></div>
                <div part="slider-field alpha-slider-field" hidden=${() => !bool(this.allowAlpha)}>
                    <input part="slider alpha-slider control" ref="alpha" type="range" min="0" max="100" step="1"
                        value=${() => Math.round(this.color().alpha*100)} aria-label=${() => this.alphaLabel} disabled=${blocked}
                        oninput=${(event: Event) => this.updateAlpha(false,event)}></div>
                <div part="toolbar"><label part="hex-field"><span part="channel-label">${() => this.hexLabel}</span>
                    <input part="hex-input control" ref="hex" type="text" autocomplete="off" spellcheck="false" disabled=${blocked}
                        aria-label=${() => this.hexLabel} value=${() => this.hexDraft[0]() ?? colorToHex(this.color())}
                        oninput=${(event: Event) => { this.hexDraft[1](this.hexInput?.value ?? ''); this.updateFromHex(false,event); }}
                        onblur=${() => this.hexDraft[1](null)}></label>
                    <cb-button part="sampler" exportparts="control:sampler-control,label:sampler-label,button-label:sampler-label,icon:sampler-icon,description:sampler-description" icon-only icon="eye" variant="ghost" size="sm" accessible-label=${() => this.samplerLabel}
                        hidden=${() => !bool(this.allowSampler) || !this.samplerLabel || !this.samplerAvailable()} disabled=${blocked}
                        onaction=${(event: Event) => { event.stopPropagation(); void this.sample(event); }}></cb-button>
                    <cb-button part="close" exportparts="control:close-control,label:close-label,button-label:close-label,icon:close-icon,description:close-description" icon-only icon="close" variant="ghost" size="sm" accessible-label=${() => this.closeLabel} hidden=${() => !this.closeLabel}
                        onaction=${(event: Event) => { event.stopPropagation(); if(this.setOpen(false,event)) this.trigger?.focus(); }}></cb-button>
                </div><div part="channels hsv-channels">${channelFields(false)}</div><div part="channels rgb-channels">${channelFields(true)}</div>
                <div part="palette-group" hidden=${() => !this.paletteColors().length && !this.addSwatchLabel}>
                    <span part="palette-label label" hidden=${() => !this.swatchesLabel}>${() => this.swatchesLabel}</span>
                    <div part="palette" ref="palette" role="group" aria-label=${() => this.swatchesLabel || null}>
                        ${repeat(() => this.paletteColors(), color => html`<cb-button part="swatch" exportparts="control:swatch-control,label:swatch-label,button-label:swatch-label,icon:swatch-icon,description:swatch-description" data-bare data-semantic-host data-color=${color}
                            aria-pressed=${() => color === this.normalizedValue()} disabled=${blocked} data-removable=${() => this.removable(color) ? '' : null}
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
                            accessible-label=${() => this.addSwatchLabel} hidden=${() => !this.addSwatchLabel} disabled=${blocked}
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
    private handlePlaneKey(event: KeyboardEvent): void {
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
        Array.from(this.paletteNode?.querySelectorAll<Button>('cb-button[part~=swatch]') ?? [])
            .find(button => button.dataset.color === normalized)?.focus();
    }
    private focusPaletteItem(index: number): void {
        const buttons = Array.from(this.paletteNode?.querySelectorAll<Button>('cb-button[part~=swatch]') ?? []);
        const button = buttons[Math.min(index, Math.max(0, buttons.length - 1))];
        if (button)
            button.focus();
        else if (!this.addSwatchButton?.hidden)
            this.addSwatchButton?.focus();
    }
    private samplerAvailable(): boolean { return typeof (this.ownerDocument.defaultView as ColorSamplerWindow | null)?.EyeDropper === 'function'; }
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
