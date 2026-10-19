import { type Template, html } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { token as v } from '../../theme/tokens.js';
import { DeviceFrameBase } from './DeviceFrameBase.js';
const css = editorCSS + `
:host{display:block;inline-size:100%;min-inline-size:0;container-type:inline-size}
[part~=root]{position:relative;display:grid;place-items:center;min-block-size:var(--component-device-frame-stage-height,440px);padding:var(--spacing-xl,24px);overflow:auto;border:1px solid ${v('--color-separator')};border-radius:var(--radius-lg,12px);background:${v('--color-surface-muted')}}
[part~=device]{position:relative;inline-size:min(100%,var(--cb-device-display-width));aspect-ratio:var(--cb-device-ratio);transition:inline-size ${v('--motion-duration-normal')} ease,aspect-ratio ${v('--motion-duration-normal')} ease}
[part~=bezel]{position:absolute;inset:0;display:grid;padding:var(--cb-device-bezel);border:1px solid color-mix(in srgb,${v('--color-border')} 70%,#000);border-radius:var(--cb-device-radius);background:var(--component-device-frame-bezel,#20262b);box-shadow:0 18px 45px color-mix(in srgb,#000 24%,transparent)}
[part~=device][data-chrome=false] [part~=bezel]{padding:0;border:0;border-radius:var(--radius-sm,6px);background:transparent}
[part~=screen]{position:relative;display:block;min-inline-size:0;min-block-size:0;overflow:auto;border-radius:var(--cb-device-screen-radius);background:${v('--color-surface')};color:${v('--color-foreground')}}
[part~=camera],[part~=notch]{position:absolute;z-index:2;background:#090b0c;pointer-events:none}
[part~=camera]{inset-block-start:calc(var(--cb-device-bezel) / 2);inset-inline-start:50%;inline-size:5px;block-size:5px;translate:-50% -50%;border-radius:50%}
[part~=notch]{inset-block-start:var(--cb-device-bezel);inset-inline-start:50%;inline-size:28%;block-size:12px;translate:-50% 0;border-radius:0 0 9px 9px}
[part~=device]:not([data-device=mobile]) [part~=notch],[part~=device][data-device=desktop] [part~=camera],[part~=device][data-chrome=false] [part~=camera],[part~=device][data-chrome=false] [part~=notch]{display:none}
[part~=stand]{position:absolute;inset-block-start:100%;inset-inline-start:50%;inline-size:24%;block-size:34px;translate:-50% 0;border-block-start:28px solid var(--component-device-frame-bezel,#20262b);border-inline:12px solid transparent}
[part~=stand]::after{content:'';position:absolute;inset-inline-start:50%;inset-block-start:0;inline-size:180%;block-size:5px;translate:-50% 0;border-radius:5px;background:var(--component-device-frame-bezel,#20262b)}
[part~=device]:not([data-device=desktop]) [part~=stand],[part~=device][data-chrome=false] [part~=stand]{display:none}
[part~=orientation]{position:absolute;z-index:3;inset-inline-end:var(--spacing-sm,8px);inset-block-start:var(--spacing-sm,8px);background:${v('--color-surface-raised')}}
:host([data-disabled]) [part~=root]{opacity:var(--component-disabled-opacity,.5)}
@container(max-width:520px){[part~=root]{min-block-size:340px;padding:var(--spacing-md,12px)}}
`;
export class DeviceFrame extends DeviceFrameBase {
    render(): Template {
        return html`<style part="styles">${css}</style><div part="root canvas">
            <div part="device frame" data-device=${this.preset}
                data-chrome=${() => String(this.chromeVisible())} style=${this.deviceStyle}>
                <div part="bezel"><div part="screen control" role="region"
                    tabindex=${() => this.unavailable ? -1 : 0}
                    aria-label=${() => this.text('screenLabel') || this.accessibleName()}
                    aria-disabled=${() => this.unavailable ? 'true' : null}>
                    <slot part="content"></slot></div><span part="camera"></span><span part="notch"></span>
                </div><span part="stand"></span>
            </div><cb-button part="orientation" exportparts="control:orientation-control,label:orientation-label,button-label:orientation-label,icon:orientation-icon,description:orientation-description" icon-only variant="ghost" icon="reset"
                hidden=${() => !this.orientationControlVisible()} disabled=${() => this.unavailable}
                accessible-label=${() => this.text('orientationLabel')}
                onaction=${(event: Event) => { event.stopPropagation(); this.toggleOrientation(event); }}></cb-button>
        </div>`;
    }
    private deviceStyle = (): string => {
        const [width, height] = this.frameSize(), preset = this.preset();
        return `--cb-device-display-width:${preset === 'mobile' ? 260 : preset === 'tablet' ? 390 : 660}px;
            --cb-device-ratio:${width} / ${height};
            --cb-device-bezel:${preset === 'desktop' ? '12px' : preset === 'tablet' ? '18px' : '14px 9px'};
            --cb-device-radius:${preset === 'desktop' ? 8 : preset === 'tablet' ? 22 : 28}px;
            --cb-device-screen-radius:${preset === 'desktop' ? 2 : preset === 'tablet' ? 10 : 20}px`;
    }
}
export { DeviceFrameBase };
export type { DeviceFrameProps, DeviceOrientation, DevicePreset } from './DeviceFrameBase.js';
