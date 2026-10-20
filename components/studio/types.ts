export type StudioKind =
    | 'text' | 'textarea' | 'number' | 'search' | 'select' | 'choice' | 'range' | 'file' | 'color'
    | 'tokens' | 'display' | 'collection' | 'status' | 'progress' | 'panel' | 'canvas' | 'editor'
    | 'shell' | 'collaboration'

export type StudioValue = string | readonly string[] | number | boolean | null

export interface StudioItem {
    id: string
    label: string
    description?: string
    disabled?: boolean
    selected?: boolean
    value?: string | number
}

export interface StudioDefinition {
    board: string
    category: string
    name: string
    className: string
    title: string
    kind: StudioKind
}

export interface StudioBoardItem {
    board: string
    category: string
    name: string
    title: string
}
