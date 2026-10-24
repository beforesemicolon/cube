import { componentGroups } from './component-entries.js'
import { iconPaths } from '../components/icons/registry.js'
import { buildBrowser } from '@beforesemicolon/builder'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { relative, resolve } from 'node:path'
import { build, type Plugin } from 'esbuild'
import { cubeTheme, flattenTheme } from '../components/theme/tokens.js'
import { browserStyles, moduleStyles, emitStyleModules } from './styles.js'
import { clientFactory } from './client-factory.js'
import { publishBuild } from './publish-build.js'
const outputRoot = await mkdtemp(resolve(tmpdir(), 'cube-build-'))
try {
    execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '-p', 'tsconfig.build.json', '--emitDeclarationOnly', '--outDir', resolve(outputRoot, 'types')], { stdio: 'inherit' })
    const sourceRoot = resolve('components')
    const entryPoints = (await readdir(sourceRoot, { recursive: true }))
        .filter(path => path.endsWith('.ts') && !path.endsWith('.d.ts') && !path.endsWith('.spec.ts') && !path.endsWith('-client.ts') && path !== 'client.ts' && path !== 'core/browser.ts')
        .map(path => resolve(sourceRoot, path))
    const styleSources = new Set<string>()
    await Promise.all((['esm', 'cjs'] as const).map(format => build({
        entryPoints, outbase: sourceRoot, outdir: resolve(outputRoot, format), format,
        platform: 'node', target: 'es2022', keepNames: true, minify: false, sourcemap: false, plugins: [moduleStyles(styleSources)],
    })))
    await emitStyleModules(sourceRoot, outputRoot, styleSources)
    await writeFile(resolve(outputRoot, 'cjs/package.json'), '{"type":"commonjs"}\n')
    const externalRuntime: Plugin = {
        name: 'cube-browser-runtime', setup(build) {
            build.onResolve({ filter: /^@beforesemicolon\/(?:web-component|markup)(?:\/|$)/ }, () => { throw new Error('Browser clients must receive the WebComponent runtime instead of importing it.') })
        },
    }
    const sizes: Record<string, number> = {}
    for (const category of ['', ...componentGroups]) {
        const result = await buildBrowser({ entry: resolve(category ? `components/${category}-client.ts` : 'components/client.ts'), out: resolve(outputRoot, category ? `${category}-client.js` : 'client.js'), esbuildOptions: {
            target: 'es2022', format: 'iife', keepNames: true, sourcemap: false, metafile: true, plugins: [externalRuntime, clientFactory(), browserStyles],
        } })
        for (const path of Object.keys(result.metafile?.inputs ?? {})) {
            if (/node_modules[\\/](echarts|@beforesemicolon[\\/](?:web-component|markup))/.test(path)) throw new Error(`Runtime was bundled: ${path}`)
        }
        for (const [path, output] of Object.entries(result.metafile?.outputs ?? {})) if (path.endsWith('.js')) sizes[`dist/${relative(outputRoot, resolve(path))}`] = output.bytes
    }
    await mkdir(resolve(outputRoot, 'themes'), { recursive: true }); await mkdir(resolve(outputRoot, 'icons'), { recursive: true })
    await writeFile(resolve(outputRoot, 'themes/cube.json'), JSON.stringify(cubeTheme, null, 2) + '\n')
    function materialize(node: unknown, mode: 'light' | 'dark'): unknown {
        if (!node || typeof node !== 'object' || Array.isArray(node)) return node
        const r = node as Record<string, unknown>, keys = Object.keys(r)
        if (keys.includes('default') && (keys.includes('light') || keys.includes('dark')) && keys.every(k => ['default','light','dark'].includes(k))) return r[mode] ?? r.default
        return Object.fromEntries(keys.map(k => [k, materialize(r[k], mode)]))
    }
    const declarations = (mode: 'light' | 'dark') => Object.entries(flattenTheme(cubeTheme, mode)).map(([k,v]) => `${k}:${v};`).join('')
    for (const mode of ['light', 'dark'] as const) {
        await writeFile(resolve(outputRoot, `themes/${mode}.json`), JSON.stringify({ ...cubeTheme, name: `cube-${mode}`, tokens: materialize(cubeTheme.tokens, mode) }, null, 2) + '\n')
        await writeFile(resolve(outputRoot, `themes/${mode}.css`), `:root{${declarations(mode)}}\n`)
    }
    await writeFile(resolve(outputRoot, 'themes/cube.css'), `:root{${declarations('light')}}@media(prefers-color-scheme:dark){:root{${declarations('dark')}}}[data-theme="light"]{${declarations('light')}}[data-theme="dark"]{${declarations('dark')}}\n`)
    for (const [name, d] of Object.entries(iconPaths)) await writeFile(resolve(outputRoot, `icons/${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`)
    const iconSymbols = Object.entries(iconPaths).map(([name,d]) => `<symbol id="${name}" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>`).join('')
    await writeFile(resolve(outputRoot, 'icons/sprite.svg'), `<svg xmlns="http://www.w3.org/2000/svg">${iconSymbols}</svg>\n`)
    const iconClasses = Object.keys(iconPaths).map(name => `.cb-icon--${name}{--cb-icon-url:url('./${name}.svg')}`).join('')
    await writeFile(resolve(outputRoot, 'icons/icons.css'), `.cb-icon{display:inline-block;inline-size:1em;block-size:1em;background:currentColor;mask:var(--cb-icon-url) center/contain no-repeat;-webkit-mask:var(--cb-icon-url) center/contain no-repeat}${iconClasses}\n`)
    await writeFile(resolve(outputRoot, 'build-report.json'), JSON.stringify({ external: ['@beforesemicolon/web-component', 'echarts'], browserBytes: sizes }, null, 2) + '\n')
    await publishBuild(outputRoot, resolve('dist'))
} finally { await rm(outputRoot, { recursive: true, force: true }) }
