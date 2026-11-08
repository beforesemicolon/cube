/** Static component CSS is immutable and can be adopted by every shadow root. */
export function sharedStylesheet(source: string): string | CSSStyleSheet {
    if (typeof CSSStyleSheet === 'undefined' || typeof CSSStyleSheet.prototype.replaceSync !== 'function') return source
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(source)
    return sheet
}
