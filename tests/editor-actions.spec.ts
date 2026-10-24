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

test('selection controls prefer above, flip below and clamp all edges for offscreen selections', () => {
    const bounds = { x: 8, y: 8, width: 384, height: 284 }, size = { width: 120, height: 32 }
    assert.deepEqual(positionControls({ x: 100, y: 100, width: 100, height: 100 }, size, bounds), { x: 90, y: 60, placement: 'above' })
    assert.deepEqual(positionControls({ x: 0, y: 10, width: 50, height: 100 }, size, bounds), { x: 8, y: 118, placement: 'below' })
    assert.deepEqual(positionControls({ x: 400, y: 400, width: 100, height: 100 }, size, bounds), { x: 272, y: 260, placement: 'above' })
    assert.deepEqual(positionControls({ x: -400, y: -400, width: 100, height: 100 }, size, bounds), { x: 8, y: 8, placement: 'below' })
})

test('action indicators retain their accessible label without changing ordinary actions', () => {
    assert.deepEqual(normalizeActions([{ id: 'inputs', label: 'Inputs', indicator: true, indicatorLabel: 'Edited inputs' }]),
        [{ id: 'inputs', label: 'Inputs', indicator: true, indicatorLabel: 'Edited inputs', disabled: false, name: '', icon: '' }])
})
