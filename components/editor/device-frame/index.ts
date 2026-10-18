import { actionLabel, createIconButton } from '../../action/create.js'
import type { IconButton } from '../../action/icon-button/index.js'
import { register } from '../../core/Component.js'
import { aria, editorCSS, el, fragment, sheet } from '../../core/editor-dom.js'
import { token as v } from '../../theme/tokens.js'
import { DeviceFrameBase } from './DeviceFrameBase.js'

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
`

export class DeviceFrame extends DeviceFrameBase {
    private deviceNode?: HTMLElement
    private screen?: HTMLElement
    private orientationButton?: IconButton

    render(): Node {
        const root = el('div', 'root canvas')
        this.deviceNode = el('div', 'device frame')
        const bezel = el('div', 'bezel')
        this.screen = el('div', 'screen control')
        this.screen.setAttribute('role', 'region')
        this.screen.tabIndex = 0
        const content = el('slot', 'content')
        this.screen.append(content)
        const camera = el('span', 'camera')
        const notch = el('span', 'notch')
        const stand = el('span', 'stand')
        bezel.append(this.screen, camera, notch)
        this.deviceNode.append(bezel, stand)
        this.orientationButton = createIconButton('orientation', 'reset', event => this.toggleOrientation(event))
        root.append(this.deviceNode, this.orientationButton)
        return fragment(sheet(css), root)
    }

    protected syncView(): void {
        if (!this.deviceNode || !this.screen || !this.orientationButton) return
        const [width, height] = this.frameSize()
        const preset = this.preset()
        const displayWidth = preset === 'mobile' ? 260 : preset === 'tablet' ? 390 : 660
        this.deviceNode.style.setProperty('--cb-device-display-width', `${displayWidth}px`)
        this.deviceNode.style.setProperty('--cb-device-ratio', `${width} / ${height}`)
        this.deviceNode.style.setProperty('--cb-device-bezel', preset === 'desktop' ? '12px' : preset === 'tablet' ? '18px' : '14px 9px')
        this.deviceNode.style.setProperty('--cb-device-radius', preset === 'desktop' ? '8px' : preset === 'tablet' ? '22px' : '28px')
        this.deviceNode.style.setProperty('--cb-device-screen-radius', preset === 'desktop' ? '2px' : preset === 'tablet' ? '10px' : '20px')
        this.deviceNode.dataset.device = preset
        this.deviceNode.dataset.chrome = String(this.chromeVisible())
        this.screen.tabIndex = this.unavailable ? -1 : 0
        aria(this.screen, 'aria-label', this.text('screenLabel') || this.accessibleName())
        aria(this.screen, 'aria-disabled', this.unavailable ? true : null)
        this.orientationButton.hidden = !this.orientationControlVisible()
        this.orientationButton.disabled = this.unavailable
        actionLabel(this.orientationButton, this.text('orientationLabel'))
    }
}

register('cb-device-frame', DeviceFrame)
export { DeviceFrameBase }
export type { DeviceFrameProps, DeviceOrientation, DevicePreset } from './DeviceFrameBase.js'
