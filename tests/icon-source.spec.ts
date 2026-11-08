import assert from 'node:assert/strict'
import { test } from 'node:test'
import { iconSource } from '../components/icons/source.js'
import { normalizeActions } from '../components/core/actions.js'
import { normalizeItems } from '../components/core/items.js'
import { iconPaths } from '../components/icons/registry.js'

test('duplicate has its own add-copy glyph, distinct from the clipboard copy command', () => {
    assert.ok(iconPaths.duplicate)
    assert.notEqual(iconPaths.duplicate, iconPaths.copy)
})

test('typography glyphs distinguish case, metrics and text sizing', () => {
    const names = ['uppercase', 'lowercase', 'capitalize', 'fullWidth', 'fullSizeKana', 'mathAuto', 'letterSpacing', 'lineHeight', 'textAutoWidth', 'textAutoHeight', 'textFixed']
    for (const name of names) assert.ok(iconPaths[name])
    assert.equal(new Set(names.map(name => iconPaths[name])).size, names.length)
    assert.equal(iconPaths.uppercase, 'M2 5h8M6 5v14M3 19h6M14 5h8M18 5v14M15 19h6')
})

test('element alignment glyphs are distinct from text alignment controls', () => {
    const alignment = ['alignTop', 'alignMiddle', 'alignBottom', 'alignStart', 'alignHorizontalCenter', 'alignEnd']
    assert.equal(new Set(alignment.map(name => iconPaths[name])).size, alignment.length)
    for (const name of [...alignment, 'alignJustify', 'uppercase']) assert.ok(iconPaths[name])
    assert.notEqual(iconPaths.alignStart, iconPaths.alignLeft)
    assert.notEqual(iconPaths.alignHorizontalCenter, iconPaths.alignCenter)
    assert.notEqual(iconPaths.alignEnd, iconPaths.alignRight)
})

test('writing, orientation and decoration glyphs are available and distinct', () => {
    const names = ['writingHorizontal', 'writingVerticalRl', 'writingVerticalLr', 'writingSidewaysRl', 'writingSidewaysLr', 'textMixed', 'textUpright', 'textSideways', 'textDecorationNone', 'overline', 'wrapBalance', 'wrapPretty', 'wrapStable', 'wrapAvoidShort']
    for (const name of names) assert.ok(iconPaths[name])
    assert.equal(new Set(names.map(name => iconPaths[name])).size, names.length)
})

test('flex spread, direction, stretch and baseline glyphs distinguish both axes', () => {
    const names = ['layoutRow', 'layoutColumn', ...['Horizontal', 'Vertical'].flatMap(axis =>
        ['Start', 'Center', 'End', 'Between', 'Around', 'Evenly'].map(spread => `spread${axis}${spread}`)),
        'alignVerticalStretch', 'alignHorizontalStretch', 'alignVerticalBaseline', 'alignHorizontalBaseline']
    for (const name of names) assert.ok(iconPaths[name], name)
    assert.equal(new Set(names.map(name => iconPaths[name])).size, names.length)
})

test('appearance glyphs provide distinct sun, moon, and system icons', () => {
    const names = ['sun', 'moon', 'system']
    for (const name of names) assert.ok(iconPaths[name])
    assert.equal(new Set(names.map(name => iconPaths[name])).size, names.length)
})

test('application glyphs cover tabular views, rich text, people, attachments and state actions', () => {
    const names = ['table', 'list', 'listOrdered', 'quote', 'calendarRange', 'users', 'userAdd', 'attachment', 'checkCircle', 'expand', 'asterisk']
    for (const name of names) assert.ok(iconPaths[name])
    assert.equal(new Set(names.map(name => iconPaths[name])).size, names.length)
    assert.notEqual(iconPaths.table, iconPaths.grid)
    assert.notEqual(iconPaths.users, iconPaths.userAdd)
})

test('icon sources accept image URLs without interpreting markup or executable protocols', () => {
    const base = 'https://example.com/app/'
    for (const value of ['/custom.svg', './custom.svg', 'https://cdn.example.com/icon.svg', 'blob:https://example.com/id', 'data:image/svg+xml,%3Csvg/%3E']) {
        assert.equal(iconSource(value, base), value)
    }
    for (const value of ['', 'javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'mailto:icons@example.com']) {
        assert.equal(iconSource(value, base), '')
    }
})

test('decoration styles and underline positions have distinct icons', () => {
    const names = ['lineSolid', 'lineDouble', 'lineDotted', 'lineDashed', 'lineWavy', 'underlineAuto', 'underlineFromFont', 'underlineUnder', 'underlineLeft', 'underlineRight', 'underlineUnderLeft', 'underlineUnderRight']
    for (const name of names) assert.ok(iconPaths[name])
    assert.equal(new Set(names.map(name => iconPaths[name])).size, names.length)
})

test('item and command normalization preserves custom icon sources', () => {
    assert.equal(normalizeItems([{ id: 'custom', label: 'Custom', iconSrc: '/custom.svg' }])[0]?.iconSrc, '/custom.svg')
    assert.equal(normalizeActions([{ id: 'custom', label: 'Custom', iconSrc: '/custom.svg' }])[0]?.iconSrc, '/custom.svg')
})
