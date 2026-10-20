import { test } from 'node:test'
import assert from 'node:assert/strict'
import { colorToHex, hsvaToRgba, normalizeColor, parseHexColor, rgbaToHsva } from '../components/styling/color-picker/color.js'

test('HEX colors preserve alpha and normalize compact notation', () => {
    assert.equal(normalizeColor('#f08'), '#ff0088')
    assert.equal(normalizeColor('#33669980'), '#33669980')
    assert.equal(normalizeColor('invalid', '#abcdef'), '#abcdef')
})

test('HSV and RGB conversions round-trip stable channel values', () => {
    const source = { red: 191, green: 174, blue: 170, alpha: .42 }
    const hsva = rgbaToHsva(source), rgba = hsvaToRgba(hsva)
    assert.deepEqual(rgba, source)
    assert.equal(colorToHex(hsva), '#bfaeaa6b')
})

test('HEX parser rejects malformed colors and supports transparency', () => {
    assert.equal(parseHexColor('#12'), null)
    assert.equal(parseHexColor('not-a-color'), null)
    assert.equal(parseHexColor('#0000')?.alpha, 0)
    assert.equal(colorToHex({ hue: 0, saturation: 100, value: 100, alpha: 1 }), '#ff0000')
})
