import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detectMention, filterMentions } from '../components/core/mentions.js'
test('mention boundaries permit literal emails, custom triggers and edits at the caret', () => {
    assert.equal(detectMention('user@example', { start: 12, end: 12 }), null)
    assert.deepEqual(detectMention('Hi @tot suffix', { start: 7, end: 7 }), { start: 3, end: 7, query: 'tot' })
    assert.equal(detectMention('@total', { start: 0, end: 3 }), null)
    assert.deepEqual(detectMention('Hi #name', { start: 8, end: 8 }, '#'), { start: 3, end: 8, query: 'name' })
    assert.equal(detectMention('@two words', { start: 10, end: 10 }), null)
})
test('mention matching respects labels, groups, search terms and disabled options', () => {
    const options = [{ id: 'total', label: 'Total', insertText: '{{total}}', group: 'State' }, { id: 'x', label: 'Hidden', insertText: 'x', disabled: true }]
    assert.equal(filterMentions(options, 'state')[0].id, 'total')
    assert.equal(filterMentions(options, '').length, 1)
})
