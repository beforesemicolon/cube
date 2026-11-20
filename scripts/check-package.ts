import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { posix, resolve } from 'node:path'
import { componentEntries, componentGroups } from './component-entries.js'
import { build } from 'esbuild'

interface Manifest {
    readonly name: string
    readonly version: string
    readonly dependencies?: Readonly<Record<string, string>>
    readonly devDependencies?: Readonly<Record<string, string>>
    readonly peerDependencies?: Readonly<Record<string, string>>
    readonly optionalDependencies?: Readonly<Record<string, string>>
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
for (const scope of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const) {
    assert(!Object.hasOwn(manifest[scope] ?? {}, '@beforesemicolon/markup'), `Cube must consume Markup through WebComponent, not ${scope}`)
}
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
const documentation = new Set(['package.json', 'README.md', 'LICENSE', 'ai/index.json', 'ai/tokens.json', 'custom-elements.json'])
const references = JSON.parse(await readFile('ai/index.json', 'utf8'))
assert.equal(references.version, manifest.version)
const skillRoot = 'skills/beforesemicolon-cube/'
assert.deepEqual(references.skill, { name: 'beforesemicolon-cube', path: skillRoot + 'SKILL.md', manifest: skillRoot + 'manifest.json' })
documentation.add(references.skill.manifest)
const skill = JSON.parse(await readFile(references.skill.manifest, 'utf8'))
assert.equal(skill.schemaVersion, 1)
assert.equal(skill.name, references.skill.name)
assert.deepEqual(Object.keys(skill.coverage).sort(), references.records.map((record: { id: string }) => record.id).sort())
const skillFiles = new Set<string>(skill.files)
assert.equal(skillFiles.size, skill.files.length, 'Duplicate file in skill manifest')
for (const path of skillFiles) {
    assert(/^(SKILL\.md|(?:references|examples)\/[a-z0-9./-]+)$/.test(path), 'Unexpected skill path: ' + path)
    assert.equal(path, posix.normalize(path), 'Non-canonical skill path')
    documentation.add(skillRoot + path)
}
for (const path of Object.values(skill.coverage))
    assert(typeof path === 'string' && path.startsWith('references/components/') && skillFiles.has(path), 'Missing component reference')
const inspection = await mkdtemp(resolve(tmpdir(), 'cube-packed-skill-'))
try {
    execFileSync('tar', ['-xzf', archive, '-C', inspection, 'package/' + skillRoot])
    const packedSkill = resolve(inspection, 'package', skillRoot)
    assert.deepEqual(JSON.parse(await readFile(resolve(packedSkill, 'manifest.json'), 'utf8')), skill)
    for (const path of skillFiles) {
        const contents = await readFile(resolve(packedSkill, path))
        assert(contents.length > 0, 'Empty packaged skill file: ' + path)
        if (!path.endsWith('.md')) continue
        for (const [, href] of contents.toString().matchAll(/\]\(([^)\s]+)\)/g)) {
            if (!href || /^(https?:|mailto:|#)/.test(href)) continue
            const linked = posix.normalize(posix.join(posix.dirname(path), href.split('#')[0]!))
            assert(skillFiles.has(linked), 'Broken packed skill link: ' + path + ' -> ' + href)
        }
        if (path.startsWith('references/components/')) {
            assert(contents.includes('Standalone classic HTML') && contents.includes('Npm browser entry'), 'Example links missing in ' + path)
        }
    }
} finally {
    await rm(inspection, { recursive: true, force: true })
}
assert.equal(references.records.length, componentEntries.length + 1)
for (const record of references.records) documentation.add(`ai/${record.path}`)
for (const file of files) {
    assert(documentation.has(file) || /^ai\/assets\/(?:tone\.wav|studio\.webm|poster\.svg)$/.test(file) || /^dist\/(?:esm\/.+\.js|cjs\/(?:.+\.js|package\.json)|types\/.+\.d\.ts|(?:[a-z-]+-)?client\.js|themes\/[^/]+\.(?:css|json)|icons\/[^/]+\.(?:css|svg))$/.test(file), `Unexpected npm payload: ${file}`)
    assert(!/(?:\.spec\.|\/description-row\/|editor-dom|build-report|\.map$)/.test(file), `Unnecessary npm payload: ${file}`)
    assert(!/^dist\/(?:esm|cjs|types)\/(?:(?:[^/]+-)?client\.|core\/browser\.)/.test(file), `Browser bootstraps belong only in the flat browser bundles: ${file}`)
    if (/\.(?:js|ts)$/.test(file)) {
        assert(!(await readFile(file, 'utf8')).includes('@beforesemicolon/markup'), `Published code/types must consume Markup through WebComponent: ${file}`)
    }
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
    const registration = await build({
        stdin: { contents: "import '@beforesemicolon/cube/overlay/modal'", resolveDir: directory },
        bundle: true, platform: 'browser', format: 'esm', write: false,
    })
    assert.match(registration.outputFiles[0]!.text, /register\d*\("cb-modal-renderer", ModalRenderer\)/, 'Bundled side-effect imports must keep the modal renderer registration')
    const entries = ['theme/tokens', 'media/controller', 'charts/model'].map(path => `${manifest.name}/dist/esm/${path}.js`)
    const allTags = [...componentEntries.map(entry => `cb-${entry.name}`), 'cb-modal-renderer'].sort()
    const smoke = `
        import assert from 'node:assert/strict';
        import { createRequire } from 'node:module';
        const require = createRequire(import.meta.url);
        assert.equal(typeof globalThis.HTMLElement, 'undefined');
        for (const name of ${JSON.stringify(entries)}) {
            const esm = await import(name), cjs = require(name.replace('/esm/', '/cjs/'));
            assert.deepEqual(Object.keys(esm).sort(), Object.keys(cjs).sort());
        }
        // A minimal DOM registry tests module evaluation/registration only;
        // rendering, stylesheets and forms are checked in real browsers.
        const registry = new Map();
        globalThis.HTMLElement = class extends EventTarget {};
        globalThis.customElements = {
            get: name => registry.get(name),
            define: (name, constructor) => { assert(!registry.has(name)); registry.set(name, constructor); },
        };
        const single = await import(${JSON.stringify(manifest.name + '/form/text-input')});
        assert.equal(registry.size, 1, 'An individual import registers only its own tag');
        assert.equal(registry.get('cb-text-input'), single.TextInput);
        const form = await import(${JSON.stringify(manifest.name + '/form')});
        assert.equal(registry.size, ${componentEntries.filter(entry => entry.path.startsWith('form/')).length}, 'A category import registers only its own category');
        assert.equal(registry.get('cb-text-input'), form.TextInput);
        const esm = await import(${JSON.stringify(manifest.name)});
        assert.deepEqual([...registry.keys()].sort(), ${JSON.stringify(allTags)}, 'ESM import registers immediately');
        assert.equal(typeof esm.TextInput, 'function');
        assert(!('initializeCube' in esm)); assert(!('ready' in esm));
        registry.clear();
        const singleCjs = require(${JSON.stringify(manifest.name + '/form/text-input')});
        assert.equal(registry.size, 1, 'An individual CJS require registers only its own tag');
        assert.equal(registry.get('cb-text-input'), singleCjs.TextInput);
        require(${JSON.stringify(manifest.name + '/form')});
        assert.equal(registry.size, ${componentEntries.filter(entry => entry.path.startsWith('form/')).length});
        const cjs = require(${JSON.stringify(manifest.name)});
        assert.deepEqual([...registry.keys()].sort(), ${JSON.stringify(allTags)}, 'CJS require registers immediately');
        assert.equal(typeof cjs.TextInput, 'function');
        assert(!('initializeCube' in cjs)); assert(!('ready' in cjs));
        assert.equal((await import(${JSON.stringify(manifest.name + '/package.json')}, {with:{type:'json'}})).default.version, ${JSON.stringify(manifest.version)});
    `
    await writeFile(resolve(directory, 'smoke.mjs'), smoke)
    execFileSync(process.execPath, ['smoke.mjs'], { cwd: directory, stdio: 'inherit' })
    const declarations = componentEntries.map((entry, index) => `import type { ${entry.className} as Component${index} } from '${manifest.name}/${entry.path}';\nimport type * as Base${index} from '${manifest.name}/${entry.path}/base';`).join('\n')
    await writeFile(resolve(directory, 'types.ts'), `${declarations}
        import { Button, TextInput } from '${manifest.name}';
        import { List, type ListRenderer } from '${manifest.name}/data-display';
        const render: ListRenderer<string> = (item, index) => { const element = document.createElement('span'); element.textContent = index + ': ' + item; return element; };
        function renderList(): void {
            const list = new List<string>(); list.items = new Set(['one']); list.renderItem = render;
            const button = new Button(); const input = new TextInput();
            void button; void input;
        }
        void renderList;
    `)
    execFileSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--lib', 'ES2022,DOM,DOM.Iterable', 'types.ts'], { cwd: directory, stdio: 'inherit' })
} finally {
    await rm(directory, { recursive: true, force: true })
}
await writeFile(resolve(artifacts, 'package-check.json'), JSON.stringify({ version: manifest.version, ...packed }, null, 2) + '\n')
console.log(`${packed.filename}: ${files.size} allowed files; ${packed.size} packed bytes; installed ESM/CJS and all component declarations verified.`)
