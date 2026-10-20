import { clamp } from '../../core/value.js'

export interface RGBAColor {
    readonly red: number
    readonly green: number
    readonly blue: number
    readonly alpha: number
}

export interface HSVAColor {
    readonly hue: number
    readonly saturation: number
    readonly value: number
    readonly alpha: number
}

function byte(value: number): number { return Math.round(clamp(value, 0, 255)) }
function percentage(value: number): number { return clamp(value, 0, 100) }
function component(value: string): number { return Number.parseInt(value, 16) }
function hexByte(value: number): string { return byte(value).toString(16).padStart(2, '0') }

export function rgbaToHsva(color: RGBAColor): HSVAColor {
    const red = byte(color.red) / 255, green = byte(color.green) / 255, blue = byte(color.blue) / 255
    const max = Math.max(red, green, blue), min = Math.min(red, green, blue), delta = max - min
    let hue = 0
    if (delta) {
        if (max === red) hue = 60 * (((green - blue) / delta) % 6)
        else if (max === green) hue = 60 * ((blue - red) / delta + 2)
        else hue = 60 * ((red - green) / delta + 4)
    }
    if (hue < 0) hue += 360
    return { hue, saturation: max ? delta / max * 100 : 0, value: max * 100, alpha: clamp(color.alpha, 0, 1) }
}

export function hsvaToRgba(color: HSVAColor): RGBAColor {
    const hue = ((color.hue % 360) + 360) % 360, saturation = percentage(color.saturation) / 100, value = percentage(color.value) / 100
    const chroma = value * saturation, sector = hue / 60, x = chroma * (1 - Math.abs(sector % 2 - 1)), match = value - chroma
    let red = 0, green = 0, blue = 0
    if (sector < 1) [red, green] = [chroma, x]
    else if (sector < 2) [red, green] = [x, chroma]
    else if (sector < 3) [green, blue] = [chroma, x]
    else if (sector < 4) [green, blue] = [x, chroma]
    else if (sector < 5) [red, blue] = [x, chroma]
    else [red, blue] = [chroma, x]
    return { red: byte((red + match) * 255), green: byte((green + match) * 255), blue: byte((blue + match) * 255), alpha: clamp(color.alpha, 0, 1) }
}

export function parseHexColor(source: string): HSVAColor | null {
    const value = source.trim().replace(/^#/, '')
    if (!/^(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return null
    const expanded = value.length <= 4 ? [...value].map(character => character.repeat(2)).join('') : value
    const alpha = expanded.length === 8 ? component(expanded.slice(6, 8)) / 255 : 1
    return rgbaToHsva({ red: component(expanded.slice(0, 2)), green: component(expanded.slice(2, 4)), blue: component(expanded.slice(4, 6)), alpha })
}

export function colorToHex(color: HSVAColor, includeAlpha = color.alpha < 1): string {
    const rgba = hsvaToRgba(color)
    return `#${hexByte(rgba.red)}${hexByte(rgba.green)}${hexByte(rgba.blue)}${includeAlpha ? hexByte(rgba.alpha * 255) : ''}`
}

export function normalizeColor(source: string, fallback = '#000000'): string {
    const parsed = parseHexColor(source) ?? parseHexColor(fallback)
    return parsed ? colorToHex(parsed) : '#000000'
}
