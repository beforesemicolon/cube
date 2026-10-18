import { buildDocs } from '@beforesemicolon/site-builder'
import { buildBrowser } from '@beforesemicolon/builder'
import { cp, mkdir, access } from 'node:fs/promises'
import { resolve } from 'node:path'
await buildBrowser({ entry: resolve('docs-cube/_template/template.config.ts'), out: 'docs-cube/_template/template.config.js', esbuildOptions: { format: 'esm', platform: 'node', minify: false, sourcemap: false } })
const result = await buildDocs({ rootDir: resolve('docs-cube'), prod: true })
const out = resolve(result.publicDir, 'assets/cube')
await mkdir(out, { recursive: true })
await cp('node_modules/@beforesemicolon/web-component/dist/client.js', resolve(out,'web-component.js'))
await cp('node_modules/echarts/dist/echarts.min.js', resolve(out,'echarts.js'))
await cp('node_modules/echarts/LICENSE', resolve(out,'echarts-LICENSE.txt'))
try { await access('node_modules/echarts/NOTICE'); await cp('node_modules/echarts/NOTICE', resolve(out,'echarts-NOTICE.txt')) }
catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
await cp('dist/client.js', resolve(out,'client.js'))
await cp('design/poster.svg', resolve(out,'poster.svg'))
await buildBrowser({ entry: resolve('scripts/docs-examples.ts'), out: resolve(out,'examples.js'), esbuildOptions: { format:'iife', sourcemap:false } })
console.log(JSON.stringify({ pages: result.pages, locales: result.locales, output: result.publicDir }))
