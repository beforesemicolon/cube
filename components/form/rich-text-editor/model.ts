export const richTextFormats = ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'] as const
export type RichTextFormat = typeof richTextFormats[number]
export interface RichTextRun { readonly text: string; readonly formats: readonly RichTextFormat[] }
export interface RichTextSelection { readonly start: number; readonly end: number }
const tags: Readonly<Record<RichTextFormat, string>> = {
    bold: 'strong', italic: 'em', underline: 'u', strikethrough: 's', superscript: 'sup', subscript: 'sub',
}
export function setFormat(formats: readonly RichTextFormat[], format: RichTextFormat, enabled: boolean): readonly RichTextFormat[] {
    const next = new Set(formats)
    next.delete(format)
    if (enabled) {
        if (format === 'superscript') next.delete('subscript')
        if (format === 'subscript') next.delete('superscript')
        next.add(format)
    }
    return richTextFormats.filter(item => next.has(item))
}
export function normalizeRuns(runs: readonly RichTextRun[], inline = false): readonly RichTextRun[] {
    const result: RichTextRun[] = []
    for (const run of runs) {
        const text = run.text.replace(/\r\n?/g, '\n').replace(/\n/g, inline ? ' ' : '\n')
        if (!text) continue
        const formats = richTextFormats.filter(format => run.formats.includes(format) && !(format === 'subscript' && run.formats.includes('superscript')))
        const previous = result.at(-1)
        if (previous && previous.formats.join() === formats.join()) result[result.length - 1] = { text: previous.text + text, formats }
        else result.push({ text, formats })
    }
    return result
}
export function plainText(runs: readonly RichTextRun[]): string { return runs.map(run => run.text).join('') }
export function serializeRuns(runs: readonly RichTextRun[]): string {
    return normalizeRuns(runs).map(run => {
        const text = run.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br>')
        return run.formats.map(format => `<${tags[format]}>`).join('') + text + [...run.formats].reverse().map(format => `</${tags[format]}>`).join('')
    }).join('')
}
export function sliceRuns(runs: readonly RichTextRun[], start: number, end: number): readonly RichTextRun[] {
    let offset = 0
    return runs.flatMap(run => {
        const from = Math.max(0, start - offset), to = Math.min(run.text.length, end - offset)
        offset += run.text.length
        return to > from ? [{ text: run.text.slice(from, to), formats: run.formats }] : []
    })
}
export function replaceRuns(runs: readonly RichTextRun[], selection: RichTextSelection, replacement: readonly RichTextRun[]): readonly RichTextRun[] {
    return normalizeRuns([...sliceRuns(runs, 0, selection.start), ...replacement, ...sliceRuns(runs, selection.end, Infinity)])
}
export function activeFormats(runs: readonly RichTextRun[], selection: RichTextSelection): readonly RichTextFormat[] {
    const selected = selection.start === selection.end
        ? sliceRuns(runs, Math.max(0, selection.start - 1), Math.max(1, selection.start))
        : sliceRuns(runs, selection.start, selection.end)
    return richTextFormats.filter(format => selected.length > 0 && selected.every(run => run.formats.includes(format)))
}
export function toggleRuns(runs: readonly RichTextRun[], selection: RichTextSelection, format: RichTextFormat): readonly RichTextRun[] {
    const enabled = !activeFormats(runs, selection).includes(format)
    const selected = sliceRuns(runs, selection.start, selection.end).map(run => ({ text: run.text, formats: setFormat(run.formats, format, enabled) }))
    return replaceRuns(runs, selection, selected)
}
