import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { componentEntries } from '../scripts/component-entries.js'

test('every published component has a colocated browser behavior contract', () => {
    assert.equal(new Set(componentEntries.map(entry => entry.path)).size, componentEntries.length)
    for (const entry of componentEntries) {
        const source = readFileSync(`components/${entry.path}/${entry.name}.spec.ts`, 'utf8')
        assert(source.includes(`componentContract('cb-${entry.name}',`), `${entry.path} must exercise its own public API`)
        assert(/\bexpect\(/.test(source), `${entry.path} needs a behavior assertion, not just a mount check`)
    }
})
