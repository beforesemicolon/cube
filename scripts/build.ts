import { componentGroups } from './component-entries.js'
import { iconPaths } from '../components/icons/registry.js'
import { buildBrowser } from '@beforesemicolon/builder'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { build, type Plugin } from 'esbuild'
import { cubeTheme, flattenTheme } from '../components/theme/tokens.js'
import { browserStyles, moduleStyles, emitStyleModules } from './styles.js'
await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '-p', 'tsconfig.build.json', '--emitDeclarationOnly'], { stdio: 'inherit' })
const sourceRoot = resolve('components')
const entryPoints = (await readdir(sourceRoot, { recursive: true }))
    .filter(path => path.endsWith('.ts') && !path.endsWith('.d.ts') && !path.endsWith('.spec.ts') && !path.endsWith('-client.ts') && path !== 'client.ts' && path !== 'core/browser.ts')
    .map(path => resolve(sourceRoot, path))
const styleSources = new Set<string>()
await Promise.all((['esm', 'cjs'] as const).map(format => build({
    entryPoints, outbase: sourceRoot, outdir: resolve('dist', format), format,
    platform: 'node', target: 'es2022', keepNames: true, minify: false, sourcemap: false, plugins: [moduleStyles(styleSources)],
})))
await emitStyleModules(sourceRoot, resolve('dist'), styleSources)
await writeFile('dist/cjs/package.json', '{"type":"commonjs"}\n')
const externalRuntime: Plugin = {
    name: 'cube-browser-runtime', setup(build) {
        build.onResolve({ filter: /^@beforesemicolon\/(?:web-component|markup)(?:\/|$)/ }, () => { throw new Error('Browser clients must receive the WebComponent runtime instead of importing it.') })
        build.onResolve({ filter: /load-echarts\.js$/ }, () => ({ path: 'echarts', namespace: 'cube-runtime' }))
        build.onLoad({ filter: /.*/, namespace: 'cube-runtime' }, () => ({ loader: 'js', contents:
            `export async function loadECharts(){const value=globalThis.echarts;if(!value?.init)throw new Error('Load echarts/dist/echarts.min.js or configureChartEngine before mounting a chart.');return value;}` }))
    },
}
const sizes: Record<string, number> = {}
for (const category of ['', ...componentGroups]) {
    const result = await buildBrowser({ entry: resolve(category ? `components/${category}-client.ts` : 'components/client.ts'), out: category ? `dist/${category}-client.js` : 'dist/client.js', esbuildOptions: {
        target: 'es2022', format: 'iife', globalName: '__CubeModule', keepNames: true, sourcemap: false, metafile: true, plugins: [externalRuntime, browserStyles],
        footer: { js: `{const b=globalThis.BFS;const c=b.CUBE??={};const pending=__CubeModule.ready;c.ready=Promise.all([c.ready,pending]);pending.then(category=>{if(category)for(const [k,v] of Object.entries(category))if(!(k in c))c[k]=v;});for(const [k,v] of Object.entries(__CubeModule))if(k!=='ready'&&!(k in c))c[k]=v;}` },
    } })
    for (const path of Object.keys(result.metafile?.inputs ?? {})) {
        if (/node_modules[\\/](echarts|@beforesemicolon[\\/](?:web-component|markup))/.test(path)) throw new Error(`Runtime was bundled: ${path}`)
    }
    for (const [path, output] of Object.entries(result.metafile?.outputs ?? {})) if (path.endsWith('.js')) sizes[path] = output.bytes
}
await mkdir('dist/themes', { recursive: true }); await mkdir('dist/icons', { recursive: true })
await writeFile('dist/themes/cube.json', JSON.stringify(cubeTheme, null, 2) + '\n')
function materialize(node: unknown, mode: 'light' | 'dark'): unknown {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return node
    const r = node as Record<string, unknown>, keys = Object.keys(r)
    if (keys.includes('default') && (keys.includes('light') || keys.includes('dark')) && keys.every(k => ['default','light','dark'].includes(k))) return r[mode] ?? r.default
    return Object.fromEntries(keys.map(k => [k, materialize(r[k], mode)]))
}
const declarations = (mode: 'light' | 'dark') => Object.entries(flattenTheme(cubeTheme, mode)).map(([k,v]) => `${k}:${v};`).join('')
for (const mode of ['light', 'dark'] as const) {
    await writeFile(`dist/themes/${mode}.json`, JSON.stringify({ ...cubeTheme, name: `cube-${mode}`, tokens: materialize(cubeTheme.tokens, mode) }, null, 2) + '\n')
    await writeFile(`dist/themes/${mode}.css`, `:root{${declarations(mode)}}\n`)
}
await writeFile('dist/themes/cube.css', `:root{${declarations('light')}}@media(prefers-color-scheme:dark){:root{${declarations('dark')}}}[data-theme="light"]{${declarations('light')}}[data-theme="dark"]{${declarations('dark')}}\n`)
for (const [name, d] of Object.entries(iconPaths)) await writeFile(`dist/icons/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`)
const iconSymbols = Object.entries(iconPaths).map(([name,d]) => `<symbol id="${name}" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>`).join('')
await writeFile('dist/icons/sprite.svg', `<svg xmlns="http://www.w3.org/2000/svg">${iconSymbols}</svg>\n`)
const iconClasses = Object.keys(iconPaths).map(name => `.cb-icon--${name}{--cb-icon-url:url('./${name}.svg')}`).join('')
await writeFile('dist/icons/icons.css', `.cb-icon{display:inline-block;inline-size:1em;block-size:1em;background:currentColor;mask:var(--cb-icon-url) center/contain no-repeat;-webkit-mask:var(--cb-icon-url) center/contain no-repeat}${iconClasses}\n`)
await writeFile('dist/build-report.json', JSON.stringify({ external: ['@beforesemicolon/web-component', 'echarts'], browserBytes: sizes }, null, 2) + '\n')
