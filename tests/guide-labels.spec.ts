import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compactGuideLabel } from '../components/editor/guide-overlay/labels.js'

test('numeric measurement labels omit implied dimensions and pixel units', () => {
    for (const [label, expected] of [
        ['838px', '838'], ['129.2px', '129.2'], ['Width 838px', '838'], ['Height: 281px', '281'],
        ['width 0', '0'], ['-2.5 px', '-2.5'], ['.5px', '.5'], ['200px · 200px', '200 · 200'],
        ['838px × 281px', '838 × 281'], ['0px', '0'],
    ]) assert.equal(compactGuideLabel(label), expected)
})

test('descriptive guide labels and non-pixel units remain unchanged', () => {
    for (const label of ['Release guide', 'Column width', 'Use 24px gutters', 'Width 50%', '10rem', 'margin left: 8px', '']) {
        assert.equal(compactGuideLabel(label), label)
    }
})
