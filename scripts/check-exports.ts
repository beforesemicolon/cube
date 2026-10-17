import { componentEntries,componentGroups } from './component-entries.js'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { createRequire } from 'node:module'
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
for (const [key, target] of Object.entries(pkg.exports)) {
    if (key.includes('*')) continue
    for (const path of typeof target === 'string' ? [target] : Object.values(target as Record<string,string>)) await access(new URL('../' + path, import.meta.url))
}
assert.equal(typeof globalThis.HTMLElement, 'undefined')
const esm = await import(new URL('../dist/esm/index.js', import.meta.url).href)
const cjs = createRequire(import.meta.url)('../dist/cjs/index.js')
assert.equal(typeof esm.loadComponent, 'function'); assert.equal(typeof cjs.loadComponent, 'function')
assert.equal(esm.lightTokens['--color-primary'], cjs.lightTokens['--color-primary'])
await assert.rejects(esm.loadComponent('audio-player'), /DOM/)
const report = JSON.parse(await readFile(new URL('../dist/build-report.json', import.meta.url), 'utf8'))
assert.equal(Object.keys(report.browserBytes).length,1+componentEntries.length+componentGroups.length)
console.log(`ESM/CJS SSR-safe root imports, export targets and ${Object.keys(report.browserBytes).length} external-runtime browser entries verified.`)
