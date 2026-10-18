import { clamp, finite, text } from '../../core/value.js'
import { normalizeColor, parseHexColor } from '../color-picker/color.js'

export type GradientType = 'linear' | 'radial'
export type GradientShape = 'circle' | 'ellipse'
export type GradientExtent = 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
export type GradientPosition = 'left top' | 'center top' | 'right top' | 'left center' | 'center' | 'right center' | 'left bottom' | 'center bottom' | 'right bottom'

export interface GradientStopInput {
    readonly id?: string
    readonly color?: string
    readonly position?: number
}

export interface GradientStop {
    readonly id: string
    readonly color: string
    readonly position: number
}

export interface GradientModel {
    readonly type: GradientType
    readonly angle: number
    readonly shape: GradientShape
    readonly extent: GradientExtent
    readonly position: GradientPosition
    readonly stops: readonly GradientStop[]
}

const types: readonly GradientType[] = ['linear', 'radial']
const shapes: readonly GradientShape[] = ['circle', 'ellipse']
const extents: readonly GradientExtent[] = ['closest-side', 'closest-corner', 'farthest-side', 'farthest-corner']
const positions: readonly GradientPosition[] = ['left top', 'center top', 'right top', 'left center', 'center', 'right center', 'left bottom', 'center bottom', 'right bottom']

export const defaultGradientStops: readonly GradientStop[] = [
    { id: 'start', color: '#2563eb', position: 0 },
    { id: 'end', color: '#8b5cf6', position: 100 },
]

function member<T extends string>(value: string, values: readonly T[], fallback: T): T {
    return values.includes(value as T) ? value as T : fallback
}

function stopColor(value: string | undefined, fallback: string): string {
    if (value?.trim().toLowerCase() === 'transparent') return '#00000000'
    return parseHexColor(value ?? '') ? normalizeColor(value ?? '') : fallback
}

export function normalizeGradientStops(source: readonly GradientStopInput[] | undefined): GradientStop[] {
    if (!Array.isArray(source) || source.length < 2) return defaultGradientStops.map(stop => ({ ...stop }))
    const used = new Set<string>()
    return source.map((stop, index) => {
        const fallback = defaultGradientStops[Math.min(index, defaultGradientStops.length - 1)]?.color ?? '#000000'
        const candidate = text(stop.id).trim() || `stop-${index + 1}`
        let id = candidate
        let suffix = 2
        while (used.has(id)) { id = `${candidate}-${suffix}`; suffix += 1 }
        used.add(id)
        return { id, color: stopColor(stop.color, fallback), position: clamp(finite(stop.position, index / Math.max(1, source.length - 1) * 100), 0, 100) }
    }).sort((left, right) => left.position - right.position)
}

function splitTopLevel(value: string): string[] {
    const parts: string[] = []
    let depth = 0
    let quote = ''
    let start = 0
    for (let index = 0; index < value.length; index += 1) {
        const character = value[index] ?? ''
        if (character === '\\') { index += 1; continue }
        if (quote) { if (character === quote) quote = ''; continue }
        if (character === '"' || character === "'") quote = character
        else if (character === '(') depth += 1
        else if (character === ')') depth -= 1
        else if (character === ',' && depth === 0) { parts.push(value.slice(start, index).trim()); start = index + 1 }
    }
    parts.push(value.slice(start).trim())
    return parts.filter(Boolean)
}

function parseStop(value: string, index: number, total: number): GradientStop | null {
    const match = /^(#[\da-f]{3,8}|transparent)(?:\s+(-?(?:\d*\.)?\d+)%?)?$/i.exec(value.trim())
    if (!match) return null
    return {
        id: `stop-${index + 1}`,
        color: stopColor(match[1], '#000000'),
        position: clamp(match[2] === undefined ? index / Math.max(1, total - 1) * 100 : Number(match[2]), 0, 100),
    }
}

function directionAngle(value: string): number {
    const directions: Readonly<Record<string, number>> = {
        'to top': 0, 'to top right': 45, 'to right': 90, 'to bottom right': 135,
        'to bottom': 180, 'to bottom left': 225, 'to left': 270, 'to top left': 315,
    }
    const normalized = value.trim().toLowerCase()
    if (directions[normalized] !== undefined) return directions[normalized]
    const match = /^(-?(?:\d*\.)?\d+)deg$/i.exec(normalized)
    return match ? Number(match[1]) : 180
}

export function parseGradient(value: string): GradientModel | null {
    const match = /^\s*(linear|radial)-gradient\(([\s\S]*)\)\s*$/i.exec(value)
    if (!match) return null
    const type = match[1]?.toLowerCase() === 'radial' ? 'radial' : 'linear'
    const parts = splitTopLevel(match[2] ?? '')
    if (parts.length < 2) return null
    let angle = 180
    let shape: GradientShape = 'circle'
    let extent: GradientExtent = 'farthest-corner'
    let position: GradientPosition = 'center'
    let stopParts = parts
    if (type === 'linear' && /^(?:to\s|[-+]?(?:\d*\.)?\d+deg$)/i.test(parts[0] ?? '')) {
        angle = directionAngle(parts[0] ?? '')
        stopParts = parts.slice(1)
    } else if (type === 'radial' && /(?:^|\s)(?:circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner|at)(?:\s|$)/i.test(parts[0] ?? '')) {
        const configuration = parts[0] ?? ''
        shape = member(configuration.match(/\b(circle|ellipse)\b/i)?.[1]?.toLowerCase() ?? '', shapes, 'circle')
        extent = member(configuration.match(/\b(closest-side|closest-corner|farthest-side|farthest-corner)\b/i)?.[1]?.toLowerCase() ?? '', extents, 'farthest-corner')
        position = member(configuration.match(/\bat\s+(.+)$/i)?.[1]?.trim().toLowerCase() ?? '', positions, 'center')
        stopParts = parts.slice(1)
    }
    const stops = stopParts.map((part, index) => parseStop(part, index, stopParts.length))
    if (stops.length < 2 || stops.some(stop => stop === null)) return null
    return { type, angle, shape, extent, position, stops: normalizeGradientStops(stops.filter((stop): stop is GradientStop => stop !== null)) }
}

function formattedNumber(value: number): string {
    return String(Math.round(value * 10) / 10)
}

export function serializeGradient(model: GradientModel): string {
    const stops = normalizeGradientStops(model.stops).map(stop => `${stop.color} ${formattedNumber(stop.position)}%`).join(', ')
    if (model.type === 'radial') return `radial-gradient(${model.shape} ${model.extent} at ${model.position}, ${stops})`
    return `linear-gradient(${formattedNumber(model.angle)}deg, ${stops})`
}

export type GradientModelInput = Omit<Partial<GradientModel>, 'stops'> & { readonly stops?: readonly GradientStopInput[] }

export function normalizeGradientModel(source: GradientModelInput): GradientModel {
    return {
        type: member(source.type ?? '', types, 'linear'),
        angle: finite(source.angle, 90),
        shape: member(source.shape ?? '', shapes, 'circle'),
        extent: member(source.extent ?? '', extents, 'farthest-corner'),
        position: member(source.position ?? '', positions, 'center'),
        stops: normalizeGradientStops(source.stops),
    }
}
