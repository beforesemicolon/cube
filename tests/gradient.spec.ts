import assert from 'node:assert/strict'
import test from 'node:test'
import {
    normalizeGradientStops, parseGradient, serializeGradient,
} from '../components/styling/gradient-editor/gradient.js'

test('linear gradients parse directions, alpha colors and implicit positions', () => {
    const gradient = parseGradient('linear-gradient(to right, #fff, #8b5cf680 40%, transparent)')
    assert.ok(gradient)
    assert.equal(gradient.type, 'linear')
    assert.equal(gradient.angle, 90)
    assert.deepEqual(gradient.stops.map(stop => [stop.color, stop.position]), [
        ['#ffffff', 0],
        ['#8b5cf680', 40],
        ['#00000000', 100],
    ])
})

test('radial gradients preserve shape, extent, origin and sorted stops', () => {
    const gradient = parseGradient('radial-gradient(ellipse closest-side at right bottom, #000 100%, #fff 0%)')
    assert.ok(gradient)
    assert.equal(gradient.type, 'radial')
    assert.equal(gradient.shape, 'ellipse')
    assert.equal(gradient.extent, 'closest-side')
    assert.equal(gradient.position, 'right bottom')
    assert.equal(serializeGradient(gradient), 'radial-gradient(ellipse closest-side at right bottom, #ffffff 0%, #000000 100%)')
})

test('stop normalization clamps positions, supplies stable IDs and never returns fewer than two stops', () => {
    assert.deepEqual(normalizeGradientStops([{ color: '#f00', position: -10 }, { id: 'same', color: '#0f0', position: 50 }, { id: 'same', color: '#00f', position: 130 }]), [
        { id: 'stop-1', color: '#ff0000', position: 0 },
        { id: 'same', color: '#00ff00', position: 50 },
        { id: 'same-2', color: '#0000ff', position: 100 },
    ])
    assert.equal(normalizeGradientStops([]).length, 2)
    assert.equal(parseGradient('linear-gradient(red, blue)'), null)
})
