import assert from 'node:assert/strict'
import { readdirSync, readFileSync, type Dirent } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import test from 'node:test'

const sourceRoot = resolve(process.cwd(), 'components')
const nativeButtonPattern = /(?:element|createElement)\([^\n]*['"]button['"]|<button(?:\s|>)/g

function typeScriptFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry: Dirent) => {
        const path = resolve(directory, entry.name)
        if (entry.isDirectory()) return typeScriptFiles(path)
        return entry.isFile() && entry.name.endsWith('.ts') ? [path] : []
    })
}

test('raw buttons are limited to semantic primitives and native form interop', () => {
    const actual: Record<string, number> = {}
    for (const path of typeScriptFiles(sourceRoot)) {
        const count = [...readFileSync(path, 'utf8').matchAll(nativeButtonPattern)].length
        if (count > 0) actual[relative(sourceRoot, path).split(sep).join('/')] = count
    }

    assert.deepEqual(actual, {
        'action/button/ButtonBase.ts': 1,
        'action/button/view.ts': 1,
    })
})

test('component renderers use templates instead of assembling or rebuilding DOM trees', () => {
    const offenders: string[] = []
    for (const path of typeScriptFiles(sourceRoot)) {
        if (!/(?:index|view)\.ts$/.test(path)) continue
        const source = readFileSync(path, 'utf8')
        if (/\b(?:element|createElement|createElementNS|createDocumentFragment|replaceChildren|appendChild)\s*\(|\.innerHTML\s*=/.test(source)) {
            offenders.push(relative(sourceRoot, path).split(sep).join('/'))
        }
    }
    assert.deepEqual(offenders, [], 'Native interop belongs outside component renderers; use reactive html bindings for presentation')
})

test('templates bind shared derived values directly instead of wrapping function calls', () => {
    const offenders: string[] = []
    for (const path of typeScriptFiles(sourceRoot)) {
        const source = readFileSync(path, 'utf8')
        if (/\$\{\s*\(\)\s*=>\s*this\.(?:accessibleName|displayLabel)\(\)\s*\}/.test(source)) {
            offenders.push(relative(sourceRoot, path).split(sep).join('/'))
        }
    }
    assert.deepEqual(offenders, [], 'Pass bound template getters directly; Markup evaluates and subscribes to them')
})
