import { buildDocs } from '@beforesemicolon/site-builder'
import { buildBrowser } from '@beforesemicolon/builder'
import { cp, mkdir, access, readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { componentDocsEntries } from './component-entries.js'

for (const { name, path } of componentDocsEntries) {
    const pagePath = `docs-cube/documentation/${path}.md`
    const page = await readFile(pagePath, 'utf8')
    const preview = /^:::component\n([\s\S]+?)\n:::/m.exec(page)?.[1]
    assert(preview && new RegExp(`<cb-${name}(?:\\s|>)`).test(preview), `${pagePath} must preview cb-${name}`)
    assert.match(page, /\/playground\/\?path=\/story\/[a-z0-9-]+/, `${pagePath} must link to the component in the Playground`)
}

await buildBrowser({ entry: resolve('docs-cube/_template/template.config.ts'), out: 'docs-cube/_template/template.config.js', esbuildOptions: { format: 'esm', platform: 'node', minify: false, sourcemap: false } })
const result = await buildDocs({ rootDir: resolve('docs-cube'), prod: true })
const redirectsPath = resolve(result.publicDir, '_redirects')
const redirects = await readFile(redirectsPath, 'utf8')
const localeFallback = /^\/\* \S+ 200$/m
assert.match(redirects, localeFallback)
// Workers counts every rule after the first wildcard toward its dynamic rule limit.
await writeFile(redirectsPath, redirects.replace(localeFallback, [
    '/playground/* /playground/:splat 200',
    '/assets/cube/* /assets/cube/:splat 200',
    '$&',
].join('\n')))
const out = resolve(result.publicDir, 'assets/cube')
await mkdir(out, { recursive: true })
await cp('node_modules/@beforesemicolon/web-component/dist/client.js', resolve(out,'web-component.js'))
await cp('node_modules/echarts/dist/echarts.min.js', resolve(out,'echarts.js'))
await cp('node_modules/echarts/LICENSE', resolve(out,'echarts-LICENSE.txt'))
try { await access('node_modules/echarts/NOTICE'); await cp('node_modules/echarts/NOTICE', resolve(out,'echarts-NOTICE.txt')) }
catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
await cp('dist/client.js', resolve(out,'client.js'))
await cp('design/poster.svg', resolve(out,'poster.svg'))
await cp('design/fixtures/studio.webm', resolve(out, 'studio.webm'))
await cp('design/fixtures/tone.wav', resolve(out, 'tone.wav'))
await buildBrowser({ entry: resolve('scripts/docs-examples.ts'), out: resolve(out,'examples.js'), esbuildOptions: { format:'iife', sourcemap:false } })
console.log(JSON.stringify({ pages: result.pages, locales: result.locales, output: result.publicDir }))
