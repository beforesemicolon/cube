export function safeHref(value: string | undefined, base = typeof document === 'undefined' ? 'https://example.invalid/' : document.baseURI): string {
    if(typeof value !== 'string' || !value.trim())return ''
    try { const url=new URL(value,base); return ['http:','https:','mailto:','tel:'].includes(url.protocol)?value:'' } catch { return '' }
}
