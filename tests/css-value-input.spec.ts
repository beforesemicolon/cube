import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cssFunctionValue, cssNumericValue } from '../components/form/css-value-input/model.js'

test('CSS numeric spelling and units remain separate without rounding', () => {
    for (const [value, number, unit] of [['141.516px', '141.516', 'px'], ['.25rem', '.25', 'rem'], ['-1e2%', '-1e2', '%'], ['0', '0', '']])
        assert.deepEqual(cssNumericValue(value!), { number, unit })
    for (const value of ['', '-', '1e', 'auto', 'calc(1px + 2rem)', '1px 2px']) assert.equal(cssNumericValue(value), null)
})

test('math arguments preserve nested expressions, variables and more than two operands', () => {
    assert.deepEqual(cssFunctionValue('min(100%, 720px)'), { name: 'min', arguments: ['100%', '720px'] })
    assert.deepEqual(cssFunctionValue('max(calc(100% - 2rem), var(--size, min(4px, 8px)), 9rem)'), { name: 'max', arguments: ['calc(100% - 2rem)', 'var(--size, min(4px, 8px))', '9rem'] })
    assert.deepEqual(cssFunctionValue('clamp(1rem, 50vw, 80rem)'), { name: 'clamp', arguments: ['1rem', '50vw', '80rem'] })
    assert.deepEqual(cssFunctionValue('min(var(--x, "a,b"), 2px /* ,) */)'), { name: 'min', arguments: ['var(--x, "a,b")', '2px /* ,) */'] })
    assert.deepEqual(cssFunctionValue('min(, )'), { name: 'min', arguments: ['', ''] })
    for (const value of ['auto', 'min(2px)', 'min(var(--x, 1px), 2px', 'min(1px), 2px)', 'clamp(1px, 2px)', 'max("x, 2px)']) assert.equal(cssFunctionValue(value), null)
})
