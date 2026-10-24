import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { is, isNot, type Template, html } from '../../core/runtime.js'

import { DeviceFrameBase } from './DeviceFrameBase.js';

export class DeviceFrame extends DeviceFrameBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<div part="root canvas">
            <div part="device frame" data-device=${this.preset}
                data-chrome=${is(() => this.chromeVisible())} style=${this.deviceStyle}>
                <div part="bezel"><div part="screen control" role="region"
                    tabindex=${() => this.unavailable ? -1 : 0}
                    aria-label=${() => this.text('screenLabel') || this.accessibleName()}
                    aria-disabled=${() => this.unavailable ? 'true' : null}>
                    <slot part="content"></slot></div><span part="camera"></span><span part="notch"></span>
                </div><span part="stand"></span>
            </div><cb-button part="orientation" exportparts="control:orientation-control,label:orientation-label,button-label:orientation-label,icon:orientation-icon,description:orientation-description" icon-only variant="ghost" icon="reset"
                hidden=${isNot(this.orientationControlVisible)} disabled=${() => this.unavailable}
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

register('cb-device-frame', DeviceFrame)
