/** Load external icons as inert images, never as injected SVG markup. */
export function iconSource(value: string | undefined, base: string): string {
    if (typeof value !== 'string' || !value.trim()) return ''
    try {
        const url = new URL(value, base)
        return ['http:', 'https:', 'blob:'].includes(url.protocol) || /^data:image\//i.test(value.trim()) ? value : ''
    } catch { return '' }
}
