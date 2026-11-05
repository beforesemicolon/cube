export type ArtboardPreviewMode = 'width' | 'device'
export interface ArtboardPreviewPreset {
    readonly id: string
    readonly label: string
    readonly width: number
    readonly height: number
    readonly category?: 'mobile' | 'tablet' | 'desktop'
}
export interface ArtboardPreviewLabels {
    readonly controls?: string
    readonly mode?: string
    readonly widthOnly?: string
    readonly device?: string
    readonly size?: string
    readonly mobile?: string
    readonly tablet?: string
    readonly desktop?: string
    readonly custom?: string
    readonly default?: string
    readonly presets?: string
    readonly dimensions?: string
    readonly width?: string
    readonly height?: string
    readonly link?: string
    readonly unlink?: string
}
export interface ArtboardPreviewValue {
    readonly mode: ArtboardPreviewMode
    readonly presetId: string
    readonly width: number
    readonly height: number
    readonly linked: boolean
}
export interface ArtboardPreviewDetail {
    readonly value: ArtboardPreviewValue
    readonly previousValue: ArtboardPreviewValue
    readonly originalEvent?: Event
}
