import { componentGroups } from './component-entries.js'
import assert from 'node:assert/strict'
import { readFile, access, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
for (const [key, target] of Object.entries(pkg.exports)) {
    if (key.includes('*')) continue
    for (const path of typeof target === 'string' ? [target] : Object.values(target as Record<string,string>)) await access(new URL('../' + path, import.meta.url))
}
assert.equal(typeof globalThis.HTMLElement, 'undefined')
const esm = await import(new URL('../dist/esm/index.js', import.meta.url).href)
const cjs = createRequire(import.meta.url)('../dist/cjs/index.js')
assert.equal(typeof esm.initializeCube, 'function'); assert.equal(typeof cjs.initializeCube, 'function')
assert.equal(typeof esm.loadCategory, 'function'); assert.equal(typeof cjs.loadCategory, 'function')
assert.equal(esm.lightTokens['--color-primary'], cjs.lightTokens['--color-primary'])
await assert.rejects(esm.loadCategory('media'), /DOM/)
for (const category of componentGroups) {
    const entry = await import(new URL(`../dist/esm/${category}/index.js`, import.meta.url).href)
    assert.equal(typeof entry.default, 'function', `${category} exports its runtime initializer`)
    await access(new URL(`../dist/${category}-client.js`, import.meta.url))
}
const files = await readdir(new URL('../dist', import.meta.url), { recursive: true })
assert(!files.some(file => file.endsWith('/client.js') && !file.startsWith('esm/') && !file.startsWith('cjs/')), 'Individual browser clients must not be emitted')
assert(!files.some(file => file.includes('editor-dom')), 'The retired DOM builder must not ship')
const report = JSON.parse(await readFile(new URL('../dist/build-report.json', import.meta.url), 'utf8'))
assert.equal(Object.keys(report.browserBytes).length, 1 + componentGroups.length)
console.log(`ESM/CJS SSR-safe root imports, export targets and ${Object.keys(report.browserBytes).length} category-only external-runtime browser entries verified.`)
