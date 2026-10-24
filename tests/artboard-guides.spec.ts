import assert from 'node:assert/strict'
import { test } from 'node:test'
import { equalGuides, guideDistances, normalizeGuides, snapGuide, type ArtboardGuide } from '../components/editor/artboard/guides.js'

test('guide normalization preserves order, isolates caller objects, and rejects invalid or duplicate records', () => {
    const source: ArtboardGuide[] = [
        { id: 'a', axis: 'y', position: 24 }, { id: 'a', axis: 'x', position: 40 },
        { id: '', axis: 'x', position: 0 }, { id: 'negative', axis: 'x', position: -1 },
        { id: 'nan', axis: 'y', position: NaN }, { id: 'b', axis: 'x', position: 0 },
    ]
    const result = normalizeGuides(source)
    assert.deepEqual(result, [source[0], source[5]])
    assert.notEqual(result[0], source[0])
    assert.equal(source.length, 6)
    assert.ok(equalGuides(result, normalizeGuides(result)))
    assert.ok(!equalGuides(result, [...result].reverse()))
})

test('guide snapping uses a six-screen-pixel threshold and only parallel guides', () => {
    const guide: ArtboardGuide = { id: 'active', axis: 'y', position: 80 }
    const guides: ArtboardGuide[] = [guide, { id: 'parallel', axis: 'y', position: 120 }, { id: 'perpendicular', axis: 'x', position: 150 }]
    assert.equal(snapGuide(11, 400, .5, guides, guide), 0)
    assert.equal(snapGuide(4, 400, 2, guides, guide), 4)
    assert.equal(snapGuide(198, 400, 2, guides, guide), 200)
    assert.equal(snapGuide(117, 400, 1, guides, guide), 120)
    assert.equal(snapGuide(149, 400, 1, guides, guide), 149)
    assert.equal(snapGuide(82, 400, 1, guides, guide), 82)
    assert.equal(snapGuide(900, 400, 1, guides, guide), 400)
    assert.deepEqual(guideDistances(guide, 400, 300), { start: 80, end: 320 })
    assert.deepEqual(guideDistances({ ...guide, axis: 'x' }, 400, 300), { start: 80, end: 220 })
})
