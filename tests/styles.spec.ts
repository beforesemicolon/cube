import assert from 'node:assert/strict'
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { parse } from '@babel/parser'
import { isClassProperty, isIdentifier, isImportDeclaration, isImportDefaultSpecifier, traverseFast } from '@babel/types'
import { build } from 'esbuild'
import { componentEntries } from '../scripts/component-entries.js'
import { browserStyles, compileStyles, emitStyleModules, moduleStyles } from '../scripts/styles.js'

test('every component attaches an imported CSS file rather than embedded style rules', () => {
    for (const entry of componentEntries) {
        const path = `components/${entry.path}/index.ts`
        const ast = parse(readFileSync(path, 'utf8'), { sourceType: 'module', plugins: ['typescript'] })
        const styles = new Set<string>()
        for (const statement of ast.program.body) {
            if (!isImportDeclaration(statement) || !statement.source.value.endsWith('.css?inline')) continue
            for (const specifier of statement.specifiers) if (isImportDefaultSpecifier(specifier)) styles.add(specifier.local.name)
        }
        const attached: string[] = []
        traverseFast(ast, node => {
            if (isClassProperty(node) && isIdentifier(node.key, { name: 'stylesheet' })) {
                assert(node.value && isIdentifier(node.value), `${path}: assign the imported stylesheet directly`)
                assert(styles.has(node.value.name), `${path}: stylesheet must come from a CSS import`)
                attached.push(node.value.name)
            }
        })
        assert.equal(attached.length, 1, `${path}: expected one stylesheet`)
    }
})

test('nested CSS imports preserve cascade and work in browser, ESM and CJS builds', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'cube-styles-test-'))
    try {
        await writeFile(resolve(directory, 'base.css'), ':host{display:block;color:red}\n')
        await writeFile(resolve(directory, 'middle.css'), '@import "./base.css"; :host{background:blue}\n')
        await writeFile(resolve(directory, 'component.css'), '@import "./middle.css"; :host{color:green}\n')
        const css = await compileStyles(resolve(directory, 'component.css'))
        assert.doesNotMatch(css, /^\s*@import\b/m)
        assert(css.indexOf('color: red') < css.indexOf('color: green'))
        assert.match(css, /background: blue/)
        await writeFile(resolve(directory, 'component.ts'), 'import stylesheet from "./component.css?inline"; export {stylesheet};\n')
        const browser = await build({ entryPoints: [resolve(directory, 'component.ts')], bundle: true, write: false, plugins: [browserStyles] })
        assert.match(browser.outputFiles[0].text, /color: green/)
        const sources = new Set<string>()
        const module = await build({ entryPoints: [resolve(directory, 'component.ts')], write: false, plugins: [moduleStyles(sources)], format: 'esm' })
        assert.match(module.outputFiles[0].text, /\.\/component\.css\.js/)
        assert.doesNotMatch(module.outputFiles[0].text, /\?inline/)
        const output = resolve(directory, 'output')
        assert.deepEqual([...sources], [await realpath(resolve(directory, 'component.css'))])
        await emitStyleModules(directory, output, sources)
        await assert.rejects(readFile(resolve(output, 'esm/base.css.js')), { code: 'ENOENT' })
        await assert.rejects(readFile(resolve(output, 'cjs/middle.css.js')), { code: 'ENOENT' })
        const esm: { default: string } = await import(pathToFileURL(resolve(output, 'esm/component.css.js')).href)
        assert.equal(esm.default, css)
        const cjs = await readFile(resolve(output, 'cjs/component.css.js'), 'utf8')
        assert.equal(cjs, `module.exports = ${JSON.stringify(css)};\n`)
    } finally { await rm(directory, { recursive: true, force: true }) }
})

test('remote CSS imports fail instead of silently disappearing from shadow stylesheets', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'cube-styles-remote-test-'))
    try {
        await writeFile(resolve(directory, 'remote.css'), '@import "https://example.com/remote.css";\n:host{display:block}\n')
        await assert.rejects(compileStyles(resolve(directory, 'remote.css')), /Unresolved CSS import/)
    } finally { await rm(directory, { recursive: true, force: true }) }
})
