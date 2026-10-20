import componentStylesheet from './styles.css?inline'
import { is, type Template, html, repeat, when } from '../../core/runtime.js'

import { finite } from '../../core/value.js';
import { GuideOverlayBase, type EditorGuide } from './GuideOverlayBase.js';

export class GuideOverlay extends GuideOverlayBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<div part="guides">
            ${repeat(this.normalizedGuides, guide => html`
                <span part=${() => `line ${guide.type}-guide`} data-axis=${() => guide.axis}
                    data-type=${() => guide.type ?? 'snap'} data-id=${() => guide.id}
                    style=${() => this.guideStyle(guide)}></span>
                ${when(is(guide.label), () => html`<span part="label"
                    style=${() => this.guideStyle(guide, true)}>${() => guide.label}</span>`)}
            `, { key: guide => guide.id })}
        </div>`;
    }
    private guideStyle(guide: EditorGuide, label = false): string {
        const scale = Math.max(.01, finite(this.zoom, 1));
        const start = finite(guide.start) * scale, end = finite(guide.end) * scale;
        const position = guide.position * scale;
        const offset = label && end > start ? (start + end) / 2 : start;
        return guide.axis === 'x'
            ? `inset-inline-start:${offset}px;inset-block-start:${position}px;${label ? '' : `inline-size:${end > start ? `${end - start}px` : '100%'}`}`
            : `inset-block-start:${offset}px;inset-inline-start:${position}px;${label ? '' : `block-size:${end > start ? `${end - start}px` : '100%'}`}`;
    }
}
export { GuideOverlayBase };
export type { GuideOverlayProps, EditorGuide, EditorGuideType } from './GuideOverlayBase.js';
