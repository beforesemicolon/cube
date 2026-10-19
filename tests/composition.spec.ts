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
