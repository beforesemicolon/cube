import { build, type Plugin } from 'esbuild'
import { resolve } from 'node:path'
import { browserStyles } from './styles.js'

/**
 * Compile the component modules inside a runtime-accepting factory. Importing a
 * module uses the installed WebComponent package; classic scripts invoke this
 * factory with BFS instead. No mutable runtime singleton or import-order shim.
 */
export function clientFactory(): Plugin {
    return {
        name: 'cube-client-factory',
        setup(builder) {
            builder.onResolve({ filter: /^cube:client(?:\/[a-z-]+)?$/ }, args => ({ path: args.path, namespace: 'cube-client' }))
            builder.onLoad({ filter: /.*/, namespace: 'cube-client' }, async args => {
                const category = args.path.split('/')[1]
                const suppliedRuntime: Plugin = {
                    name: 'supplied-webcomponent',
                    setup(inner) {
                        inner.onResolve({ filter: /^@beforesemicolon\/web-component$/ }, () => ({ path: 'runtime', namespace: 'cube-runtime' }))
                        inner.onLoad({ filter: /^runtime$/, namespace: 'cube-runtime' }, () => ({ loader: 'js', contents:
                            `export const { WebComponent, HtmlTemplate, html, css, state, effect, element, repeat, when, is, isNot, and, or, oneOf, val, pick, unsafeHTML } = cubeRuntime;` }))
                        inner.onResolve({ filter: /^@beforesemicolon\/(?:web-component|markup)(?:\/|$)/ }, () => { throw new Error('Cube clients must use the supplied runtime.') })
                        inner.onResolve({ filter: /load-echarts\.js$/ }, () => ({ path: 'echarts', namespace: 'cube-runtime' }))
                        inner.onLoad({ filter: /^echarts$/, namespace: 'cube-runtime' }, () => ({ loader: 'js', contents:
                            `export async function loadECharts(){const value=globalThis.echarts;if(!value?.init)throw new Error('Load echarts/dist/echarts.min.js or configureChartEngine before mounting a chart.');return value;}` }))
                    },
                }
                const result = await build({
                    entryPoints: [resolve(category ? `components/${category}/index.ts` : 'components/index.ts')],
                    bundle: true, write: false, format: 'cjs', platform: 'browser', target: 'es2022',
                    keepNames: true, metafile: true, plugins: [suppliedRuntime, browserStyles],
                })
                for (const path of Object.keys(result.metafile.inputs)) {
                    if (/node_modules[\\/](echarts|@beforesemicolon[\\/](?:web-component|markup))/.test(path)) throw new Error(`Runtime was bundled: ${path}`)
                }
                const source = result.outputFiles[0]?.text
                if (!source) throw new Error(`Missing client factory: ${args.path}`)
                return { loader: 'js', contents: `export default function createComponents(cubeRuntime) {\nconst module = { exports: {} };\n${source}\nreturn module.exports;\n}` }
            })
        },
    }
}
