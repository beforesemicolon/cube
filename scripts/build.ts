import { buildBrowser, buildModules } from '@beforesemicolon/builder'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import type { Plugin } from 'esbuild'
import { cubeTheme, flattenTheme } from '../components/theme/tokens.js'
import { mediaIconPaths } from '../components/media/icons.js'
await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '--emitDeclarationOnly'], { stdio: 'inherit' })
await buildModules({ directoryPath: resolve('components'), esbuildOptions: { outbase: resolve('components'), target: 'es2022', minify: false, sourcemap: true } })
await writeFile('dist/cjs/package.json', '{"type":"commonjs"}\n')
const externalRuntime: Plugin = {
    name: 'cube-browser-runtime', setup(build) {
        build.onResolve({ filter: /^@beforesemicolon\/web-component$/ }, () => ({ path: 'web-component', namespace: 'cube-runtime' }))
        build.onResolve({ filter: /load-echarts\.js$/ }, () => ({ path: 'echarts', namespace: 'cube-runtime' }))
        build.onLoad({ filter: /.*/, namespace: 'cube-runtime' }, args => ({ loader: 'js', contents: args.path === 'web-component'
            ? `const value=globalThis.BFS?.WebComponent;if(!value)throw new Error('Load @beforesemicolon/web-component/dist/client.js before Cube.');export const WebComponent=value;`
            : `export async function loadECharts(){const value=globalThis.echarts;if(!value?.init)throw new Error('Load echarts/dist/echarts.min.js or configureChartEngine before mounting a chart.');return value;}` }))
    },
}
const entries = ['media/audio-player', 'media/video-player', 'charts/cartesian-chart', 'charts/pie-chart', 'theme/theme-provider', 'media', 'charts', 'theme']
const sizes: Record<string, number> = {}
for (const entry of ['', ...entries]) {
    const result = await buildBrowser({ entry: resolve(entry ? `components/${entry}/index.ts` : 'components/client.ts'), out: entry ? `dist/${entry}/client.js` : 'dist/client.js', esbuildOptions: {
        target: 'es2022', format: 'iife', globalName: '__CubeModule', keepNames: true, sourcemap: true, metafile: true, plugins: [externalRuntime],
        footer: { js: `{const b=globalThis.BFS??={};const c=b.CUBE??={};for(const [k,v] of Object.entries(__CubeModule))if(!(k in c))c[k]=v;}` },
    } })
    for (const path of Object.keys(result.metafile?.inputs ?? {})) {
        if (/node_modules[\\/](echarts|@beforesemicolon[\\/]web-component)/.test(path)) throw new Error(`Runtime was bundled: ${path}`)
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
for (const [name, d] of Object.entries(mediaIconPaths)) await writeFile(`dist/icons/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}" fill="${name==='play'?'currentColor':'none'}" stroke="currentColor" stroke-width="${name==='pause'?4:1.5}" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`)
await writeFile('dist/build-report.json', JSON.stringify({ external: ['@beforesemicolon/web-component', 'echarts'], browserBytes: sizes }, null, 2) + '\n')
