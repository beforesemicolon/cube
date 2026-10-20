import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { componentEntries, componentGroups } from './component-entries.js'

interface Manifest {
    readonly name: string
    readonly version: string
    readonly exports: Readonly<Record<string, string | Readonly<Record<string, string>>>>
    readonly publishConfig: { readonly access: string; readonly tag: string }
}
interface PackResult {
    readonly filename: string
    readonly size: number
    readonly unpackedSize: number
    readonly shasum: string
    readonly files: readonly { readonly path: string }[]
}

const manifest: Manifest = JSON.parse(await readFile('package.json', 'utf8'))
assert.equal(manifest.publishConfig.access, 'public', 'Cube is a public scoped package')
if (manifest.version.includes('-')) assert.notEqual(manifest.publishConfig.tag, 'latest', 'Prereleases must not default to the stable tag')
const artifacts = resolve('release-artifacts')
await mkdir(artifacts, { recursive: true })
const [packed]: PackResult[] = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', artifacts], { encoding: 'utf8' }))
assert(packed, 'npm pack must produce one tarball')
const files = new Set(packed.files.map(file => file.path))
const archive = resolve(artifacts, packed.filename)
assert.equal(createHash('sha1').update(await readFile(archive)).digest('hex'), packed.shasum, 'The archive must match npm pack metadata')
const archiveFiles = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n').filter(path => !path.endsWith('/')).map(path => path.replace(/^package\//, ''))
assert.deepEqual(new Set(archiveFiles), files, 'Inspect the actual archive, not just npm metadata')
const documentation = new Set(['package.json', 'README.md', 'MIGRATION.md', 'THIRD_PARTY.md', 'LICENSE'])
for (const file of files) {
    assert(documentation.has(file) || /^dist\/(?:esm\/.+\.js|cjs\/(?:.+\.js|package\.json)|types\/.+\.d\.ts|(?:[a-z-]+-)?client\.js|themes\/[^/]+\.(?:css|json)|icons\/[^/]+\.(?:css|svg))$/.test(file), `Unexpected npm payload: ${file}`)
    assert(!/(?:\.spec\.|\/description-row\/|editor-dom|build-report|\.map$)/.test(file), `Unnecessary npm payload: ${file}`)
    assert(!/^dist\/(?:esm|cjs|types)\/(?:(?:[^/]+-)?client\.|core\/browser\.)/.test(file), `Browser bootstraps belong only in the flat browser bundles: ${file}`)
}
for (const file of documentation) assert(files.has(file), `Missing ${file}`)
for (const [key, target] of Object.entries(manifest.exports)) {
    if (key.includes('*')) continue
    for (const path of typeof target === 'string' ? [target] : Object.values(target)) assert(files.has(path.replace(/^\.\//, '')), `Unpacked export ${key}: ${path}`)
}
for (const entry of componentEntries) for (const [format, extension] of [['esm', 'js'], ['cjs', 'js'], ['types', 'd.ts']] as const) {
    for (const name of ['index', 'base']) assert(files.has(`dist/${format}/${entry.path}/${name}.${extension}`), `Missing ${format} ${entry.path}/${name}`)
}
for (const category of componentGroups) assert(files.has(`dist/${category}-client.js`), `Missing ${category} browser client`)
for (const format of ['esm', 'cjs']) {
    const component = await readFile(`dist/${format}/core/Component.js`, 'utf8')
    assert(component.includes(`"${manifest.version}"`) || component.includes(`'${manifest.version}'`), 'Package and component registration versions differ')
}

const directory = await mkdtemp(resolve(tmpdir(), 'cube-installed-consumer-'))
try {
    await writeFile(resolve(directory, 'package.json'), JSON.stringify({ name: 'cube-release-consumer', private: true, type: 'module' }))
    execFileSync('npm', ['install', archive, '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'], { cwd: directory, stdio: 'inherit' })
    const entries = [manifest.name, ...['core', 'studio', ...componentGroups].map(category => `${manifest.name}/${category}`)]
    const smoke = `
        import assert from 'node:assert/strict';
        import { createRequire } from 'node:module';
        const require = createRequire(import.meta.url);
        assert.equal(typeof globalThis.HTMLElement, 'undefined');
        for (const name of ${JSON.stringify(entries)}) {
            const esm = await import(name), cjs = require(name);
            if (!name.endsWith('/studio')) {
                assert.equal(typeof esm.default, 'function', name + ' ESM initializer');
                assert.equal(typeof cjs.default, 'function', name + ' CJS initializer');
            }
        }
        assert.equal((await import(${JSON.stringify(manifest.name + '/package.json')}, {with:{type:'json'}})).default.version, ${JSON.stringify(manifest.version)});
    `
    await writeFile(resolve(directory, 'smoke.mjs'), smoke)
    execFileSync(process.execPath, ['smoke.mjs'], { cwd: directory, stdio: 'inherit' })
    const declarations = componentEntries.map((entry, index) => `import type { ${entry.className} as Component${index} } from '${manifest.name}/${entry.path}';\nimport type * as Base${index} from '${manifest.name}/${entry.path}/base';`).join('\n')
    await writeFile(resolve(directory, 'types.ts'), `${declarations}
        import initializeCube, { type CubeRuntime } from '${manifest.name}';
        import initializeDataDisplay, { type ListRenderer } from '${manifest.name}/data-display';
        const render: ListRenderer<string> = (item, index) => { const element = document.createElement('span'); element.textContent = index + ': ' + item; return element; };
        declare const runtime: CubeRuntime;
        async function initialize(): Promise<void> {
            const { List } = await initializeDataDisplay(runtime);
            const list = new List<string>(); list.items = new Set(['one']); list.renderItem = render;
            await initializeCube(runtime);
        }
        void initialize;
    `)
    execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--lib', 'ES2022,DOM,DOM.Iterable', 'types.ts'], { cwd: directory, stdio: 'inherit' })
} finally {
    await rm(directory, { recursive: true, force: true })
}
await writeFile(resolve(artifacts, 'package-check.json'), JSON.stringify({ version: manifest.version, ...packed }, null, 2) + '\n')
console.log(`${packed.filename}: ${files.size} allowed files; ${packed.size} packed bytes; installed ESM/CJS and all component declarations verified.`)
