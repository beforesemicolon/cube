/** x is a horizontal line (Y position); y is a vertical line (X position), as in GuideOverlay. */
export interface ArtboardGuide { readonly id: string; readonly axis: 'x' | 'y'; readonly position: number }
export type ArtboardGuideOperation = 'create' | 'move' | 'remove' | 'cancel'

export function normalizeGuides(guides: readonly ArtboardGuide[]): readonly ArtboardGuide[] {
    const ids = new Set<string>()
    return (Array.isArray(guides) ? guides : []).filter((guide: ArtboardGuide) => {
        if (!guide || typeof guide.id !== 'string' || !guide.id.trim() || ids.has(guide.id) ||
            !['x', 'y'].includes(guide.axis) || !Number.isFinite(guide.position) || guide.position < 0) return false
        ids.add(guide.id)
        return true
    }).map(({ id, axis, position }) => ({ id, axis, position }))
}

export function equalGuides(left: readonly ArtboardGuide[], right: readonly ArtboardGuide[]): boolean {
    return left.length === right.length && left.every((guide, index) => {
        const other = right[index]
        return other?.id === guide.id && other.axis === guide.axis && other.position === guide.position
    })
}

export function snapGuide(position: number, extent: number, scale: number, guides: readonly ArtboardGuide[], guide: ArtboardGuide): number {
    const bounded = Math.max(0, Math.min(extent, position))
    const candidates = [0, extent / 2, extent, ...guides.filter(other => other.id !== guide.id && other.axis === guide.axis).map(other => other.position)]
        .filter(value => value >= 0 && value <= extent)
    const closest = candidates.reduce((best, value) => Math.abs(value - bounded) < Math.abs(best - bounded) ? value : best, candidates[0])
    return Math.abs(closest - bounded) <= 6 / Math.max(.01, scale) ? closest : Math.max(0, Math.min(extent, Math.round(bounded)))
}

export function guideDistances(guide: ArtboardGuide, width: number, height: number): { readonly start: number; readonly end: number } {
    return { start: guide.position, end: (guide.axis === 'y' ? width : height) - guide.position }
}
