import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeActions, type ComponentAction } from '../components/core/actions.js'
import { positionControls } from '../components/editor/selection-overlay/controls.js'

test('application actions preserve IDs and metadata without mutating data; invalid/duplicate commands are omitted', () => {
    const actions: readonly ComponentAction[] = [
        { id: 'copy', icon: 'copy', name: 'duplicate', label: 'Copy', disabled: true },
        { id: 'copy', label: 'Duplicate' }, { id: '', label: 'No id' }, { id: 'blank', label: '' },
    ]
    const next = normalizeActions(actions)
    assert.deepEqual(next, [actions[0]])
    assert.notEqual(next[0], actions[0])
    assert.equal(actions.length, 4)
})

test('selection controls stay attached above their object, including outside viewport edges', () => {
    const size = { width: 120, height: 32 }
    assert.deepEqual(positionControls({ x: 100, y: 100, width: 100, height: 100 }, size), { x: 90, y: 60, placement: 'above' })
    assert.deepEqual(positionControls({ x: 0, y: 10, width: 50, height: 100 }, size), { x: -35, y: -30, placement: 'above' })
    assert.deepEqual(positionControls({ x: 400, y: 400, width: 100, height: 100 }, size), { x: 390, y: 360, placement: 'above' })
    assert.deepEqual(positionControls({ x: -400, y: -400, width: 100, height: 100 }, size), { x: -410, y: -440, placement: 'above' })
    assert.deepEqual(positionControls({ x: 100, y: 100, width: 100, height: 100 }, size, 32), { x: 90, y: 36, placement: 'above' })
    const boundary = { x: 8, y: 8, width: 384, height: 284 }
    assert.deepEqual(positionControls({ x: 0, y: 10, width: 50, height: 100 }, size, 8, boundary), { x: 8, y: 118, placement: 'below' })
    assert.deepEqual(positionControls({ x: 0, y: 10, width: 50, height: 100 }, size, 8, boundary, true), { x: 8, y: 8, placement: 'above' })
    assert.deepEqual(positionControls({ x: 100, y: 100, width: 400, height: 100 }, size, 8, undefined, false, 'end'), { x: 380, y: 60, placement: 'above' })
    assert.deepEqual(positionControls({ x: 100, y: 100, width: 400, height: 100 }, size, 8, undefined, false, 'start'), { x: 100, y: 60, placement: 'above' })
})

test('action indicators retain their accessible label without changing ordinary actions', () => {
    assert.deepEqual(normalizeActions([{ id: 'inputs', label: 'Inputs', indicator: true, indicatorLabel: 'Edited inputs' }]),
        [{ id: 'inputs', label: 'Inputs', indicator: true, indicatorLabel: 'Edited inputs', disabled: false, name: '', icon: '' }])
})


test('standalone selection actions avoid clamped ancestor preview controls', () => {
    const selection = { x: 100, y: 70, width: 500, height: 40 }
    const size = { width: 120, height: 32 }
    const boundary = { x: 8, y: 8, width: 984, height: 584 }
    const preview = { x: 140, y: 8, width: 420, height: 50 }
    assert.deepEqual(positionControls(selection, size, 8, boundary, false, 'center', [preview]),
        { x: 290, y: 118, placement: 'below' })
    // A canvas toolbar is not clamped, and unrelated horizontal chrome cannot displace actions.
    assert.deepEqual(positionControls(selection, size, 8, undefined, false, 'center', [preview]),
        { x: 290, y: 30, placement: 'above' })
    assert.deepEqual(positionControls(selection, size, 8, boundary, false, 'center', [{ ...preview, x: 700 }]),
        { x: 290, y: 30, placement: 'above' })
})
