/** Choose the higher-contrast neutral foreground for an opaque sRGB background. */
export function avatarContrastForeground(red: number, green: number, blue: number): '#000000' | '#ffffff' {
    const linear = (channel: number): number => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }
    const luminance = 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
    return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff'
}

const contrastContexts = new WeakMap<Document, CanvasRenderingContext2D>()
export const supportsNativeContrast = (document: Document): boolean =>
    document.defaultView?.CSS?.supports('color', 'contrast-color(red)') ?? false

function contrastContext(document: Document): CanvasRenderingContext2D | null {
    const existing = contrastContexts.get(document)
    if (existing) return existing
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (context) contrastContexts.set(document, context)
    return context
}

/** Browser-native color parsing preserves CSS colors such as OKLCH/color-mix. */
export function resolvedAvatarForeground(surface: HTMLElement): string | null {
    const context = contrastContext(surface.ownerDocument)
    if (!context) return null
    const styles = getComputedStyle(surface)
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 1, 1)
    context.fillStyle = styles.getPropertyValue('--color-surface').trim() || '#ffffff'
    context.fillRect(0, 0, 1, 1)
    context.fillStyle = styles.backgroundColor
    context.fillRect(0, 0, 1, 1)
    const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data
    return avatarContrastForeground(red, green, blue)
}
