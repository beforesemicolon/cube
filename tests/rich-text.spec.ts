import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activeFormats, normalizeRuns, plainText, replaceRuns, resolveReferences, serializeRuns, setFormat, toggleRuns, type RichTextRun } from '../components/form/rich-text-editor/model.js'

test('rich text serialization escapes text, canonicalizes marks, and round-trips line breaks', () => {
    const runs: RichTextRun[] = [{ text: '<a>&\n', formats: ['underline', 'bold'] }, { text: 'next', formats: ['bold', 'underline'] }]
    assert.equal(serializeRuns(runs), '<strong><u>&lt;a&gt;&amp;<br>next</u></strong>')
    assert.equal(plainText(normalizeRuns(runs, true)), '<a>& next')
    assert.equal(runs.length, 2)
    assert.deepEqual(setFormat(['bold', 'subscript'], 'superscript', true), ['bold', 'superscript'])
    assert.deepEqual(setFormat(['superscript'], 'subscript', true), ['subscript'])
})
test('formatting selected substrings preserves adjacent content and toggles mixed selections consistently', () => {
    const runs: RichTextRun[] = [{ text: 'Hello world', formats: [] }]
    const selection = { start: 0, end: 5 }, marked = toggleRuns(runs, selection, 'bold')
    assert.equal(serializeRuns(marked), '<strong>Hello</strong> world')
    assert.deepEqual(activeFormats(marked, selection), ['bold'])
    assert.equal(serializeRuns(toggleRuns(marked, selection, 'bold')), 'Hello world')
    assert.equal(serializeRuns(toggleRuns(marked, { start: 0, end: 11 }, 'italic')), '<strong><em>Hello</em></strong><em> world</em>')
    assert.equal(serializeRuns(replaceRuns(marked, { start: 3, end: 8 }, [{ text: '!', formats: ['subscript'] } ])), '<strong>Hel</strong><sub>!</sub>rld')
})

test('reference display and source stay distinct through formatting, replacement, and adjacent tokens', () => {
    const runs = resolveReferences([{ text: 'Customer {{version}} testimonials', formats: [] }], [{ value: '{{version}}', text: '1.3.6' }])
    assert.equal(plainText(runs), 'Customer 1.3.6 testimonials')
    assert.equal(serializeRuns(runs), 'Customer {{version}} testimonials')
    const formatted = toggleRuns(runs, { start: 10, end: 12 }, 'bold')
    assert.equal(serializeRuns(formatted), 'Customer <strong>{{version}}</strong> testimonials')
    assert.equal(serializeRuns(toggleRuns(runs, { start: 0, end: plainText(runs).length }, 'bold')), '<strong>Customer {{version}} testimonials</strong>')
    assert.equal(plainText(formatted), 'Customer 1.3.6 testimonials')
    assert.equal(serializeRuns(replaceRuns(formatted, { start: 9, end: 14 }, [{ text: 'Updated', formats: [] }])), 'Customer Updated testimonials')
    const adjacent = resolveReferences([{ text: '{{version}}{{version}}', formats: [] }], [{ value: '{{version}}', text: '1.3.6' }])
    assert.equal(serializeRuns(adjacent), '{{version}}{{version}}')
    assert.equal(plainText(adjacent), '1.3.61.3.6')
    assert.equal(serializeRuns(resolveReferences([{ text: '{{empty}}', formats: [] }], [{ value: '{{empty}}', text: '' }])), '{{empty}}')
})
