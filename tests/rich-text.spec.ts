import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activeFormats, normalizeRuns, plainText, replaceRuns, serializeRuns, setFormat, toggleRuns, type RichTextRun } from '../components/form/rich-text-editor/model.js'

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
