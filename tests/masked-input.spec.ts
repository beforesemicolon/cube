import assert from 'node:assert/strict'
import test from 'node:test'
import { formatMaskedValue, unmaskValue } from '../components/form/masked-input/mask.js'

test('input masks distinguish digit, letter, and alphanumeric tokens', () => {
    assert.equal(formatMaskedValue('6175550142', '(999) 999-9999'), '(617) 555-0142')
    assert.equal(formatMaskedValue('cube2048', 'AAAA-9999'), 'cube-2048')
    assert.equal(formatMaskedValue('A7x92Q4lm', '***-***-***'), 'A7x-92Q-4lm')
})

test('input masks ignore incompatible characters and preserve escaped token literals', () => {
    assert.equal(formatMaskedValue('6a1b7', '999'), '617')
    assert.equal(formatMaskedValue('cube42', '\\A-AAAA-99'), 'A-cube-42')
})

test('unmasking returns only token values from formatted or raw input', () => {
    assert.equal(unmaskValue('(212) 555-0188', '(999) 999-9999'), '2125550188')
    assert.equal(unmaskValue('CUBE-2048', 'AAAA-9999'), 'CUBE2048')
})
