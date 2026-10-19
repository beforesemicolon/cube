import { type Template, element, html } from '../../core/runtime.js'
import { editorCSS } from '../../theme/styles.js'
import { finite } from '../../core/value.js';
import { GuideOverlayBase } from './GuideOverlayBase.js';
const css = editorCSS + `
:host{position:absolute;z-index:var(--z-index-guides,15);inset:0;display:block;overflow:visible;pointer-events:none}
[part~=line]{position:absolute;background:var(--component-guide-color,var(--color-primary));pointer-events:none}[part~=line][data-axis=x]{block-size:1px}[part~=line][data-axis=y]{inline-size:1px}
[part~=line][data-type=measurement]{background:var(--component-measurement-color,var(--color-warning))}[part~=line][data-type=insertion]{background:var(--component-insertion-color,var(--color-success));box-shadow:0 0 0 1px color-mix(in srgb,var(--component-insertion-color,var(--color-success)) 25%,transparent)}
[part~=label]{position:absolute;translate:-50% -50%;padding:2px 5px;border-radius:3px;background:var(--component-guide-label-background,var(--color-primary));color:var(--color-primary-foreground);font:600 10px/1.3 var(--typography-mono-font-family);white-space:nowrap}
`;
export class GuideOverlay extends GuideOverlayBase {
    private surface?: HTMLElement;
    render(): Template { this.surface = element('div', { attributes: { part: 'guides' } }) as HTMLDivElement; return html`<style part="styles">${css}</style>${this.surface}`; }
    protected mount(): void { this.syncView(); }
    protected update(): void { this.syncView(); }
    protected syncView(): void {
        if (!this.surface)
            return;
        const scale = Math.max(.01, finite(this.zoom, 1));
        this.surface.replaceChildren(...this.normalizedGuides().flatMap(guide => {
            const line = element('span', { attributes: { part: `line ${guide.type}-guide` } }) as HTMLSpanElement;
            line.dataset.axis = guide.axis;
            line.dataset.type = guide.type ?? 'snap';
            line.dataset.id = guide.id;
            const start = finite(guide.start) * scale, end = finite(guide.end) * scale, position = guide.position * scale;
            if (guide.axis === 'x')
                Object.assign(line.style, { insetInlineStart: `${start}px`, inlineSize: end > start ? `${end - start}px` : '100%', insetBlockStart: `${position}px` });
            else
                Object.assign(line.style, { insetBlockStart: `${start}px`, blockSize: end > start ? `${end - start}px` : '100%', insetInlineStart: `${position}px` });
            if (!guide.label)
                return [line];
            const label = element('span', { attributes: { part: 'label' }, textContent: guide.label }) as HTMLSpanElement;
            if (guide.axis === 'x')
                Object.assign(label.style, { insetInlineStart: `${end > start ? (start + end) / 2 : start}px`, insetBlockStart: `${position}px` });
            else
                Object.assign(label.style, { insetInlineStart: `${position}px`, insetBlockStart: `${end > start ? (start + end) / 2 : start}px` });
            return [line, label];
        }));
    }
}
export { GuideOverlayBase };
export type { GuideOverlayProps, EditorGuide, EditorGuideType } from './GuideOverlayBase.js';
