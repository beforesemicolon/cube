import { type Template, html, repeat, when } from '../../core/runtime.js';
import { editorCSS } from '../../theme/styles.js';
import { finite } from '../../core/value.js';
import { GuideOverlayBase, type EditorGuide } from './GuideOverlayBase.js';
const css = editorCSS + `
:host{position:absolute;z-index:var(--z-index-guides,15);inset:0;display:block;overflow:visible;pointer-events:none}
[part~=line]{position:absolute;background:var(--component-guide-color,var(--color-primary));pointer-events:none}[part~=line][data-axis=x]{block-size:1px}[part~=line][data-axis=y]{inline-size:1px}
[part~=line][data-type=measurement]{background:var(--component-measurement-color,var(--color-warning))}[part~=line][data-type=insertion]{background:var(--component-insertion-color,var(--color-success));box-shadow:0 0 0 1px color-mix(in srgb,var(--component-insertion-color,var(--color-success)) 25%,transparent)}
[part~=label]{position:absolute;translate:-50% -50%;padding:2px 5px;border-radius:3px;background:var(--component-guide-label-background,var(--color-primary));color:var(--color-primary-foreground);font:600 10px/1.3 var(--typography-mono-font-family);white-space:nowrap}
`;
export class GuideOverlay extends GuideOverlayBase {
    render(): Template {
        return html`<style part="styles">${css}</style><div part="guides">
            ${repeat(() => this.normalizedGuides(), guide => html`
                <span part=${() => `line ${guide.type}-guide`} data-axis=${() => guide.axis}
                    data-type=${() => guide.type ?? 'snap'} data-id=${() => guide.id}
                    style=${() => this.guideStyle(guide)}></span>
                ${when(() => Boolean(guide.label), () => html`<span part="label"
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
