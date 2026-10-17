export const record = (value: unknown): Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>) : {}
export const text = (value: unknown, fallback = ''): string =>
    typeof value === 'string' ? value : fallback
export const finite = (value: unknown, fallback = 0): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback
export const bool = (value: unknown, fallback = false): boolean =>
    value === null || value === undefined ? fallback : value === true || value === '' || value === 'true'
export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
export function mediaURL(value: unknown, base: string): string {
    if (!text(value).trim()) return ''
    const url = new URL(text(value), base)
    if (!['https:', 'http:', 'blob:'].includes(url.protocol)
        && !(url.protocol === 'data:' && /^data:(audio|video)\//i.test(url.href))) {
        throw new TypeError('Unsupported media URL protocol')
    }
    return url.href
}
