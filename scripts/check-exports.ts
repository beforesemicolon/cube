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
const esm = await import(new URL('../dist/esm/theme/tokens.js', import.meta.url).href)
const cjs = createRequire(import.meta.url)('../dist/cjs/theme/tokens.js')
assert.equal(esm.lightTokens['--color-primary'], cjs.lightTokens['--color-primary'])
for (const category of componentGroups) {
    const entry = await readFile(new URL(`../dist/esm/${category}/index.js`, import.meta.url), 'utf8')
    assert(!/initialize|\basync\b|\bawait\b/.test(entry), `${category} must register automatically and synchronously`)
    await access(new URL(`../dist/${category}-client.js`, import.meta.url))
}
const files = await readdir(new URL('../dist', import.meta.url), { recursive: true })
for (const file of files.filter(file => /^(esm|cjs)\//.test(file) && file.endsWith('.js'))) {
    const source = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8')
    assert(!/\.css\?inline/.test(source), `${file} must resolve CSS imports for published modules`)
}
assert(!files.some(file => file.includes('/description-row/')), 'The removed Description Row component must not ship')
for (const client of ['client.js', 'data-display-client.js']) {
    const source = await readFile(new URL(`../dist/${client}`, import.meta.url), 'utf8')
    assert(!source.includes('cb-description-row'), `${client} must not register Description Row`)
}
assert(!files.some(file => file.endsWith('/client.js') && !file.startsWith('esm/') && !file.startsWith('cjs/')), 'Individual browser clients must not be emitted')
assert(!files.some(file => file.includes('editor-dom')), 'The retired DOM builder must not ship')
const report = JSON.parse(await readFile(new URL('../dist/build-report.json', import.meta.url), 'utf8'))
assert.equal(Object.keys(report.browserBytes).length, 1 + componentGroups.length)
console.log(`ESM/CJS utilities, self-initializing category exports and ${Object.keys(report.browserBytes).length} external-runtime browser entries verified.`)
