export const richTextFormats = ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript'] as const
export type RichTextFormat = typeof richTextFormats[number]
/** The host owns resolution. Cube retains the source value while displaying its text. */
export interface RichTextReference { readonly value: string; readonly text: string }
export interface RichTextRun { readonly text: string; readonly formats: readonly RichTextFormat[]; readonly reference?: string }
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
        if (!text && !run.reference) continue
        const formats = richTextFormats.filter(format => run.formats.includes(format) && !(format === 'subscript' && run.formats.includes('superscript')))
        const previous = result.at(-1)
        if (previous && !previous.reference && !run.reference && previous.formats.join() === formats.join()) result[result.length - 1] = { text: previous.text + text, formats }
        else result.push({ ...run, text, formats })
    }
    return result
}
export function plainText(runs: readonly RichTextRun[]): string { return runs.map(run => run.text).join('') }
const escapedText = (value: string, breaks = true): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', breaks ? '<br>' : '\n')
export function serializeRuns(runs: readonly RichTextRun[], editing = false): string {
    const normalized = normalizeRuns(editing ? runs : runs.map(run => ({ text: run.reference || run.text, formats: run.formats })))
    return normalized.map(run => {
        const text = editing && run.reference
            ? `<span data-cb-reference="${escapedText(run.reference, false).replaceAll('"', '&quot;')}" contenteditable="false">${escapedText(run.text, false)}</span>`
            : escapedText(run.reference || run.text)
        return run.formats.map(format => `<${tags[format]}>`).join('') + text + [...run.formats].reverse().map(format => `</${tags[format]}>`).join('')
    }).join('')
}
/** Resolve only declared tokens, never evaluate application expressions. */
export function resolveReferences(runs: readonly RichTextRun[], references: readonly RichTextReference[], inline = false): readonly RichTextRun[] {
    const values = new Map(references.filter(reference => reference.value).map(reference => [reference.value, reference.text || '\u200b']))
    if (!values.size) return runs
    const pattern = new RegExp([...values.keys()].sort((a, b) => b.length - a.length).map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu')
    return normalizeRuns(runs.flatMap(run => {
        if (run.reference) return [run]
        const result: RichTextRun[] = []; let offset = 0
        for (const match of run.text.matchAll(pattern)) {
            if (match.index > offset) result.push({ text: run.text.slice(offset, match.index), formats: run.formats })
            result.push({ text: values.get(match[0])!, formats: run.formats, reference: match[0] })
            offset = match.index + match[0].length
        }
        if (offset < run.text.length) result.push({ text: run.text.slice(offset), formats: run.formats })
        return result
    }), inline)
}
/** A reference is one authored value; touching part of it formats/replaces the whole value. */
export function referenceSelection(runs: readonly RichTextRun[], selection: RichTextSelection): RichTextSelection {
    let offset = 0, { start, end } = selection
    for (const run of runs) {
        const next = offset + run.text.length
        if (run.reference) {
            if (start === end && start > offset && start < next) start = end = start - offset < next - start ? offset : next
            else if (start < next && end > offset) { start = Math.min(start, offset); end = Math.max(end, next) }
        }
        offset = next
    }
    return { start, end }
}
export function sliceRuns(runs: readonly RichTextRun[], start: number, end: number): readonly RichTextRun[] {
    let offset = 0
    return runs.flatMap(run => {
        const from = Math.max(0, start - offset), to = Math.min(run.text.length, end - offset)
        offset += run.text.length
        return to > from ? [{ text: run.text.slice(from, to), formats: run.formats, ...(run.reference && from === 0 && to === run.text.length ? { reference: run.reference } : {}) }] : []
    })
}
export function replaceRuns(runs: readonly RichTextRun[], selection: RichTextSelection, replacement: readonly RichTextRun[]): readonly RichTextRun[] {
    const range = referenceSelection(runs, selection)
    return normalizeRuns([...sliceRuns(runs, 0, range.start), ...replacement, ...sliceRuns(runs, range.end, Infinity)])
}
export function activeFormats(runs: readonly RichTextRun[], selection: RichTextSelection): readonly RichTextFormat[] {
    const selected = selection.start === selection.end
        ? sliceRuns(runs, Math.max(0, selection.start - 1), Math.max(1, selection.start))
        : sliceRuns(runs, selection.start, selection.end)
    return richTextFormats.filter(format => selected.length > 0 && selected.every(run => run.formats.includes(format)))
}
export function toggleRuns(runs: readonly RichTextRun[], selection: RichTextSelection, format: RichTextFormat): readonly RichTextRun[] {
    const range = referenceSelection(runs, selection)
    const enabled = !activeFormats(runs, range).includes(format)
    const selected = sliceRuns(runs, range.start, range.end).map(run => ({ ...run, formats: setFormat(run.formats, format, enabled) }))
    return replaceRuns(runs, range, selected)
}
