import { Component, type CommonProps } from '../../core/Component.js'
import { finite, scalarText } from '../../core/value.js'

export type EditorGuideType = 'snap' | 'measurement' | 'insertion'
export interface EditorGuide { id: string; axis: 'x' | 'y'; position: number; start?: number; end?: number; label?: string; type?: EditorGuideType }
export interface GuideOverlayProps extends CommonProps { guides?: readonly EditorGuide[]; zoom?: number }

/** Normalizes editor guides without owning document snapping policy. */
export abstract class GuideOverlayBase<P extends GuideOverlayProps = GuideOverlayProps> extends Component<P> {
    static observedAttributes = [...Component.observedAttributes, 'guides', 'zoom']
    guides: readonly EditorGuide[] = []
    zoom = 1
    protected normalizedGuides = (): readonly EditorGuide[] => {
        const ids = new Set<string>()
        return Array.isArray(this.guides) ? this.guides.flatMap((guide, index) => {
            if (!guide || typeof guide !== 'object') return []
            const id = scalarText(guide.id).trim() || `guide-${index + 1}`
            if (ids.has(id)) return []
            ids.add(id)
            return [{ id, axis: guide.axis === 'y' ? 'y' as const : 'x' as const, position: finite(guide.position), start: finite(guide.start), end: finite(guide.end), label: scalarText(guide.label), type: ['measurement', 'insertion'].includes(guide.type ?? '') ? guide.type ?? 'snap' : 'snap' }]
        }) : []
    }
}
