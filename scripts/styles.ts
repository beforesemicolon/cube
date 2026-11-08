import { build, type Plugin } from 'esbuild'
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const compiled = new Map<string, Promise<string>>()
const stylesheetRuntime = fileURLToPath(new URL(`../components/core/shared-stylesheet.${import.meta.url.endsWith('.ts') ? 'ts' : 'js'}`, import.meta.url))

/** Flatten CSS imports before handing text to a constructed shadow stylesheet. */
export function compileStyles(path: string): Promise<string> {
    const absolute = resolve(path)
    let result = compiled.get(absolute)
    if (!result) {
        result = build({
            entryPoints: [absolute], bundle: true, write: false, outfile: 'stylesheet.css',
            target: 'es2022', minify: false, legalComments: 'none', logLevel: 'silent',
        }).then(output => {
            const css = output.outputFiles.find(file => file.path.endsWith('.css'))
            if (!css) throw new Error(`No compiled stylesheet for ${absolute}`)
            if (/^\s*@import\b/m.test(css.text)) throw new Error(`Unresolved CSS import in ${absolute}; shadow stylesheets require local imports`)
            return css.text
        })
        compiled.set(absolute, result)
    }
    return result
}

/** Vite owns ?inline during development; category bundles need the same behavior. */
export const browserStyles: Plugin = {
    name: 'cube-shadow-styles',
    setup(build) {
        build.onResolve({ filter: /\.css\?inline$/ }, args => ({
            path: resolve(args.resolveDir, args.path.slice(0, -'?inline'.length)), namespace: 'cube-css',
        }))
        build.onLoad({ filter: /./, namespace: 'cube-css' }, async args => ({
            contents: `import { sharedStylesheet } from ${JSON.stringify(stylesheetRuntime)}; export default sharedStylesheet(${JSON.stringify(await compileStyles(args.path))});`, loader: 'js', resolveDir: dirname(stylesheetRuntime),
        }))
    },
}

/** Keep module imports unbundled, but point CSS inputs to generated text modules. */
export function moduleStyles(sources: Set<string>): Plugin {
    return {
        name: 'cube-module-styles',
        setup(build) {
            build.onLoad({ filter: /\.ts$/ }, async args => ({
                contents: (await readFile(args.path, 'utf8')).replace(
                    /(from\s*['"])([^'"]+\.css)\?inline(['"])/g,
                    (_match: string, prefix: string, path: string, quote: string): string => {
                        sources.add(resolve(dirname(args.path), path))
                        return `${prefix}${path}.js${quote}`
                    },
                ),
                loader: 'ts', resolveDir: dirname(args.path),
            }))
        },
    }
}

/** Emit only directly imported CSS modules; nested imports are already flattened. */
export async function emitStyleModules(sourceRoot: string, outputRoot: string, sources: ReadonlySet<string>): Promise<void> {
    const root = await realpath(sourceRoot)
    // Also emit the small runtime helper for standalone style-module consumers.
    for (const format of ['esm', 'cjs'] as const) await build({
        entryPoints: [stylesheetRuntime], outfile: resolve(outputRoot, format, 'core/shared-stylesheet.js'),
        format, platform: 'neutral', target: 'es2022', logLevel: 'silent',
    })
    for (const path of [...sources].sort()) {
        const stylesheet = JSON.stringify(await compileStyles(path))
        const name = `${relative(root, path)}.js`
        const helperPath = relative(dirname(path), resolve(root, 'core/shared-stylesheet.js')).replaceAll('\\', '/')
        const helper = helperPath.startsWith('.') ? helperPath : `./${helperPath}`
        for (const format of ['esm', 'cjs'] as const) {
            const output = resolve(outputRoot, format, name)
            await mkdir(dirname(output), { recursive: true })
            await writeFile(output, format === 'esm'
                ? `import { sharedStylesheet } from ${JSON.stringify(helper)}; export default sharedStylesheet(${stylesheet});\n`
                : `const { sharedStylesheet } = require(${JSON.stringify(helper)}); module.exports = sharedStylesheet(${stylesheet});\n`)
        }
    }
}
