import assert from 'node:assert/strict'
import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, posix, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from '@babel/parser'
import type * as t from '@babel/types'
import { componentDocsEntries } from './component-entries.js'
import { cubeEventNames } from '../stories/event-names.js'
import { cubeTheme, flattenTheme } from '../components/theme/tokens.js'

type Named = { name: string }
type Property = Named & { type?: string; attribute?: string; default?: string; readonly?: boolean }
type Attribute = Named & { property?: string; type?: string; values?: string[] }
type Event = Named & { cancelable?: boolean; detail?: string; bubbles?: boolean; composed?: boolean }
type Slot = Named
type Part = Named
type Source = { path: string; text: string; ast: t.File }
type Klass = { node: t.ClassDeclaration; source: Source }
const manifest = JSON.parse(await readFile('package.json', 'utf8'))
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'))
const docsRoot = 'https://cube.beforesemicolon.com'
const scriptVersions = {
    runtime: '1.22.0',
    chartEngine: lock.packages['node_modules/echarts'].version as string,
}
const root = resolve('components')
const files = await readdir(root, { recursive: true })
const sources = new Map<string, Source>()
const classes = new Map<string, Klass>()
const aliases = new Map<string, { node: t.TSTypeAliasDeclaration; source: Source }>()
const globals = ['BFS.WebComponent', 'BFS.MARKUP.html', 'BFS.css']

function visit(value: unknown, callback: (node: t.Node) => void): void {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) { for (const child of value) visit(child, callback); return }
    const node = value as t.Node
    if (!node.type) return
    callback(node)
    for (const [key, child] of Object.entries(value)) {
        if (!['loc', 'leadingComments', 'trailingComments', 'innerComments'].includes(key))
            visit(child, callback)
    }
}
function parseSource(text: string) {
    return parse(text, { sourceType: 'module', plugins: ['typescript'], attachComment: false })
}
function sourceText(source: Source, node?: t.Node | null): string | undefined {
    if (!node || node.start == null || node.end == null) return
    const value = source.text.slice(node.start, node.end).replace(/\s+/g, ' ').trim()
    return value.length > 280 ? undefined : value
}
function nameOf(node?: t.Node | null): string | undefined {
    if (node?.type === 'Identifier') return node.name
    if (node?.type === 'StringLiteral') return node.value
}
function memberName(node: t.Node): string | undefined {
    return node.type === 'MemberExpression' ? nameOf(node.property) : undefined
}
function isObjectProperty(node: t.Node): node is t.ObjectProperty {
    return node.type === 'ObjectProperty'
}
function unique<T extends Named>(values: T[]): T[] {
    return Array.from(new Map(values.map(value => [value.name, value])).values())
        .sort((a, b) => a.name.localeCompare(b.name, 'en'))
}
for (const file of files.sort()) {
    if (!file.endsWith('.ts') || /\.(?:d|spec)\.ts$/.test(file)) continue
    const text = await readFile(resolve(root, file), 'utf8')
    const source: Source = { path: file, text, ast: parseSource(text) }
    sources.set(file, source)
    visit(source.ast, node => {
        if (node.type === 'ClassDeclaration' && node.id) {
            assert(!classes.has(node.id.name), `Duplicate Cube class: ${node.id.name}`)
            classes.set(node.id.name, { node, source })
        }
        if (node.type === 'TSTypeAliasDeclaration') aliases.set(node.id.name, { node, source })
    })
}
const registered = new Map<string, Klass>()
for (const source of sources.values()) visit(source.ast, node => {
    if (node.type !== 'CallExpression' || nameOf(node.callee) !== 'register') return
    const tag = nameOf(node.arguments[0])
    const type = nameOf(node.arguments[1])
    if (!tag?.startsWith('cb-') || !type) return
    const klass = classes.get(type)
    assert(klass, `Registration without class: ${tag}: ${type}`)
    assert(!registered.has(tag), `Duplicate tag: ${tag}`)
    registered.set(tag, klass)
})
assert.deepEqual([...registered.keys()].sort(), componentDocsEntries.map(entry => `cb-${entry.name}`).sort())

function lineage(leaf: Klass): Klass[] {
    const parent = nameOf(leaf.node.superClass)
    if (!parent || !classes.has(parent)) return [leaf]
    return [...lineage(classes.get(parent)!), leaf]
}
// Evaluate only registration in a minimal DOM registry. No element is constructed;
// browser interaction and accessible behavior have separate browser coverage.
type RegisteredConstructor = { observedAttributes?: string[] }
const constructors = new Map<string, RegisteredConstructor>()
globalThis.HTMLElement = class extends EventTarget {} as typeof HTMLElement
globalThis.customElements = {
    get: name => constructors.get(name),
    define: (name, ctor) => {
        assert(!constructors.has(name), `Built module registered ${name} twice`)
        constructors.set(name, ctor as unknown as RegisteredConstructor)
    },
} as CustomElementRegistry
await import(pathToFileURL(resolve('dist/esm/index.js')).href)
assert.deepEqual([...constructors.keys()].sort(), [...registered.keys()].sort(), 'Built export registration changed')

function members(klass: Klass) {
    const properties: Property[] = []
    const methods: (Named & { signature?: string })[] = []
    const internal = new Set(['stylesheet', 'render', 'onMount', 'onUpdate', 'onError', 'emit'])
    for (const { node, source } of lineage(klass)) {
        for (const member of node.body.body) {
            if (member.type !== 'ClassProperty' && member.type !== 'ClassMethod') continue
            const name = nameOf(member.key)
            if (!name || internal.has(name) || member.static || ['private', 'protected'].includes(member.accessibility ?? '') || (member.type === 'ClassMethod' && member.kind === 'constructor')) continue
            if (member.type === 'ClassProperty' || member.kind === 'get' || member.kind === 'set') {
                const annotation = member.type === 'ClassProperty' ? member.typeAnnotation : member.returnType
                const init = member.type === 'ClassProperty' ? member.value : undefined
                const primitive = init?.type === 'StringLiteral' ? 'string' : init?.type === 'BooleanLiteral' ? 'boolean' : init?.type === 'NumericLiteral' ? 'number' : undefined
                const value = init && ['StringLiteral', 'BooleanLiteral', 'NumericLiteral', 'NullLiteral'].includes(init.type) ? sourceText(source, init) : undefined
                properties.push({
                    name,
                    type: annotation?.type === 'TSTypeAnnotation' ? sourceText(source, annotation.typeAnnotation) : primitive,
                    default: value,
                    readonly: member.type === 'ClassProperty' ? member.readonly || undefined : member.kind === 'get' || undefined,
                })
            } else {
                const signature = source.text.slice(member.start!, member.body.start!).trim().replace(/\s+/g, ' ')
                methods.push({ name, signature })
            }
        }
    }
    return { properties: unique(properties), methods: unique(methods) }
}
function valuesFor(type?: string, seen = new Set<string>()): string[] | undefined {
    if (!type || seen.has(type)) return
    seen.add(type)
    const alias = aliases.get(type)
    if (alias) return valuesFor(sourceText(alias.source, alias.node.typeAnnotation), seen)
    // Return only closed string-literal unions: no coercion, numeric, or dynamic types.
    const alternatives = type.split('|').map(s => s.trim()).filter(s => s !== 'undefined')
    if (!alternatives.length || alternatives.some(s => !/^(['"])[\w -]*\1$/.test(s))) return
    return alternatives.map(s => s.slice(1, -1))
}
function attributesFor(tag: string, properties: Property[]): Attribute[] {
    const result = (constructors.get(tag)?.observedAttributes ?? []).map(name => {
        const camel = name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
        // Observed attrs may map to inherited runtime accessors not declared by Cube.
        const property = properties.find(prop => prop.name === camel)
        if (property) property.attribute = name
        return { name, property: property?.name, type: property?.type, values: valuesFor(property?.type) }
    })
    return unique(result)
}
function privateImports(start: Source, include: (path: string) => boolean): Source[] {
    const result = new Map<string, Source>()
    function collect(source: Source) {
        if (result.has(source.path)) return
        result.set(source.path, source)
        for (const node of source.ast.program.body) {
            if (node.type !== 'ImportDeclaration' && node.type !== 'ExportNamedDeclaration' && node.type !== 'ExportAllDeclaration') continue
            if (!node.source?.value.startsWith('.')) continue
            const path = posix.normalize(posix.join(posix.dirname(source.path), node.source.value)).replace(/\.js$/, '.ts')
            const next = sources.get(path)
            if (next && include(next.path)) collect(next)
        }
    }
    collect(start)
    return [...result.values()]
}

function eventsFor(klass: Klass): Event[] {
    const events: Event[] = []
    const chain = lineage(klass)
    const sourceUnits: { node: t.Node; source: Source }[] = chain.flatMap(({ node, source }, index) =>
        node.body.body.filter(member => {
            if (member.type !== 'ClassMethod' || member.computed) return true
            // An overriding method can deliberately retain its parent behavior.
            // Keep such inherited events only if the override calls super.
            const method = nameOf(member.key)
            return chain.slice(index + 1).every(({ node: subclass, source: lower }) => {
                const override = subclass.body.body.find(child => child.type === 'ClassMethod' && nameOf(child.key) === method)
                return !override || lower.text.slice(override.start!, override.end!).includes(`super.${method}(`)
            })
        }).map(node => ({ node, source }))
    )
    const chart = klass.source.path.startsWith('charts/')
    const modal = klass.source.path === 'overlay/modal/index.ts'
    for (const path of [...(chart ? ['charts/view.ts'] : []), ...(modal ? ['overlay/modal/service.ts'] : [])]) {
        const source = sources.get(path)
        assert(source, `Missing semantic event source ${path}`)
        sourceUnits.push({ node: source.ast, source })
    }
    for (const { node, source } of sourceUnits) visit(node, token => {
        if (token.type === 'CallExpression') {
            const called = memberName(token.callee)
            if (called !== 'emit' && called !== 'request') return
            const names: string[] = []
            visit(token.arguments[0], node => {
                if (node.type === 'StringLiteral' && /^[a-z][a-z0-9-]*$/.test(node.value)) names.push(node.value)
            })
            for (const name of names) events.push({
                name, detail: sourceText(source, token.arguments[1]),
                bubbles: true, composed: true, cancelable: called === 'request',
            })
        } else if (token.type === 'NewExpression' && nameOf(token.callee) === 'CustomEvent' && token.arguments[0]?.type === 'StringLiteral') {
            const options = token.arguments[1]
            const fields = options?.type === 'ObjectExpression' ? options.properties.filter(isObjectProperty) : []
            const flag = (name: string) => fields.some(p => nameOf(p.key) === name && p.value.type === 'BooleanLiteral' && p.value.value)
            events.push({ name: token.arguments[0].value, detail: sourceText(source, fields.find(p => nameOf(p.key) === 'detail')?.value), bubbles: flag('bubbles'), composed: flag('composed'), cancelable: flag('cancelable') })
        }
    })
    const stateEvent = events.filter(e => ['beforechange', 'change'].includes(e.name))
    for (const event of stateEvent) {
        if (event.detail === 'changeDetail') event.detail = 'value, previousValue, originalEvent, and component-specific values'
        if (klass.node.id?.name === 'Button') event.detail = 'pressed, value, previousValue, originalEvent (pressed toggle only)'
    }
    if (klass.node.id?.name === 'RemoteCursor') {
        const file = sources.get('studio/templates.ts')!
        let detail: string | undefined
        visit(file.ast, node => {
            if (node.type === 'CallExpression' && memberName(node.callee) === 'emit' && nameOf(node.arguments[0]) === 'nudge') detail = sourceText(file, node.arguments[1])
        })
        assert(detail, 'Review the shared remote cursor nudge event')
        events.push({ name: 'nudge', detail, bubbles: true, composed: true, cancelable: false })
    }
    if (klass.node.id?.name === 'List') events.push({ name: 'scroll', bubbles: false, composed: false, cancelable: false })
    const publicEvents = new Set<string>(cubeEventNames)
    return unique(events.filter(event => publicEvents.has(event.name) && !(klass.node.id?.name === 'Link' && ['beforechange', 'change'].includes(event.name))))
}

function viewsFor(klass: Klass): Source[] {
    const chain = lineage(klass)
    const folders = new Set(chain.filter(({ source }) => !source.path.startsWith('core/')).map(({ source }) => dirname(source.path)))
    const viewFiles = new Map<string, Source>()
    for (const { source } of chain) for (const view of privateImports(source, path => folders.has(dirname(path)) && !path.endsWith('/index.ts'))) viewFiles.set(view.path, view)
    return [...viewFiles.values()]
}

async function hooksFor(klass: Klass): Promise<{ slots: Slot[]; parts: Part[]; cssProperties: Named[] }> {
    const chain = lineage(klass)
    const slots: Slot[] = [], parts: Part[] = [], cssProperties: Named[] = []
    const scanPart = (name: string) => {
        if (/^[a-z][\w-]*$/.test(name)) parts.push({ name })
    }
    const hookSources = viewsFor(klass).map(source => source.text)
    const workspace = klass.node.id?.name === 'Workspace'
    if (workspace) {
        const panelNames = [...klass.source.text.matchAll(/this\.panelTemplate\('([a-z-]+)'\)/g)].map(match => match[1]!)
        assert(panelNames.length && /<slot name=\$\{panel\}/.test(klass.source.text), 'Review Workspace panel slot generation')
        for (const panel of panelNames) {
            slots.push({ name: panel })
            for (const [, template] of klass.source.text.matchAll(/\bpart=\$\{`([^`]+)`\}/g)) {
                const candidates = template!.replaceAll('${panel}', panel).split(/\s+/)
                for (const candidate of candidates) scanPart(candidate)
            }
        }
    }
    const studioView = klass.source.text.includes('createStudioView(')
    if (studioView) {
        const kind = chain.map(item => /\bcomponentKind(?:\s*:\s*StudioKind)?\s*=\s*'([a-z]+)'/.exec(item.source.text)?.[1]).find(Boolean)
        assert(kind, `Studio control ${klass.node.id?.name} has no known view kind`)
        const template = sources.get('studio/templates.ts')!
        // Only inspect the branch selected by this component's source-declared
        // studio kind. Opening all branches would label nonexistent hooks.
        const branch = ['text', 'textarea', 'number', 'range'].includes(kind)
            ? 'primitive'
            : kind === 'collaboration'
                ? 'collection'
                : kind === 'progress'
                    ? 'status'
                    : ['choice', 'tokens', 'file', 'collection', 'display', 'status', 'canvas'].includes(kind)
                        ? kind
                        : 'panel'
        const names = new Set([branch, 'root'])
        if (branch === 'primitive') names.add('input')
        if (branch === 'panel') names.add('field')
        visit(template.ast, node => {
            if (node.type !== 'VariableDeclarator' || !names.has(nameOf(node.id) ?? '') || !node.init) return
            let text = template.text.slice(node.init.start!, node.init.end!)
            const owner = klass.node.id?.name
            if (branch === 'choice' && owner !== 'Switch') text = text.replace(/part="switch-(?:track|thumb)"/g, '')
            if (branch === 'primitive' && owner !== 'Stepper') text = text.replace(/part="(?:field-shell stepper|stepper-button (?:decrement|increment)-button)"/g, '')
            if (branch === 'primitive' && owner !== 'UnitInput') text = text.replace(/part="(?:field-affix unit unit-static|unit unit-select)"/g, '')
            hookSources.push(text)
        })
    }
    for (const text of hookSources) {
        // Match named and default slots in actual template literals; no guessed dynamic names.
        for (const [, attrs] of text.matchAll(/<slot(?=\s|>)([^>]*)>/g)) {
            const name = /\bname\s*=\s*["']([\w-]+)["']/.exec(attrs)?.[1]
            if (name || !/\bname\s*=/.test(attrs)) slots.push({ name: name ?? '' })
        }
        for (const [, names] of text.matchAll(/(?<![-\w])part\s*=\s*["']([\w -]+)["']/g)) names.split(/\s+/).forEach(scanPart)
        for (const [, names] of text.matchAll(/\bexportparts\s*=\s*["']([^"'${]+)["']/g)) {
            for (const mapping of names.split(',')) scanPart(mapping.trim().split(/\s*:\s*/).at(-1)!)
        }
    }
    for (const source of viewsFor(klass)) {
        const tokenSources = [source.text]
        for (const [, file] of source.text.matchAll(/['"](\.[^'"]+\.css)\?inline['"]/g))
            tokenSources.push(await readFile(resolve('components', dirname(source.path), file!), 'utf8'))
        for (const text of tokenSources) for (const [, property] of text.matchAll(/var\((--[\w-]+)/g)) cssProperties.push({ name: property! })
    }
    if (chain.some(item => item.node.id?.name === 'ButtonBase')) parts.push({ name: 'label' })
    return { slots: unique(slots), parts: unique(parts), cssProperties: unique(cssProperties) }
}
const guide: Record<string, { keywords?: string[]; example?: string; accessibility?: string; rules?: { accessibleNameAttributes?: string[] } }> = {
    'cb-button': {
        keywords: ['icon-only', 'remove', 'delete', 'action', 'button', 'toggle', 'pressed', 'keyboard'],
        example: '<cb-button size="tiny" icon="close" icon-only accessible-label="Remove item"></cb-button>',
        accessibility: 'Name icon-only buttons with accessible-label or label. Use action for ordinary activation. Set pressed only for a persistent toggle; listen for change and read detail.pressed.',
        rules: { accessibleNameAttributes: ['accessible-label', 'label'] },
    },
    'cb-audio-player': {
        keywords: ['audio', 'player', 'playback', 'media', 'play', 'pause', 'sound'],
        accessibility: 'Name the media with media-title or accessible-label. Supply labels for transport and slider controls.',
    },
    'cb-modal-renderer': {
        accessibility: 'Mount the renderer in the theme scope that the hosted dialogs should inherit. Give the dialog its own heading and accessible close control.',
    },
}

const output = resolve('ai')
const indexRecords = []
const indexedEvents = new Set<string>()
const cemModules = new Map<string, { kind: 'javascript-module'; path: string; declarations: unknown[]; exports: unknown[] }>()
const scriptsFor = (category: string) => [
    { package: '@beforesemicolon/web-component', version: scriptVersions.runtime, path: 'dist/client.js', global: 'BFS.WebComponent' },
    ...(category === 'charts' ? [{ package: 'echarts', version: scriptVersions.chartEngine, path: 'dist/echarts.min.js', global: 'echarts' }] : []),
    { package: manifest.name, version: manifest.version, path: `dist/${category}-client.js`, requires: [{ package: '@beforesemicolon/web-component', path: 'dist/client.js' }] },
]
// Classic category bundles and per-element imports are intentionally isolated.
// Read literal composed tags from the component and its own shared views. The
// resulting install instructions add the companions without changing runtime.
const registrationPaths = new Map(componentDocsEntries.map(entry => [
    `cb-${entry.name}`, entry.name === 'modal-renderer' ? 'overlay/modal' : entry.path,
]))
const dependencies = new Map<string, string[]>()
for (const [tag, klass] of registered) {
    const children = new Set<string>()
    for (const { text } of viewsFor(klass)) for (const [, child] of text.matchAll(/<(cb-[\w-]+)/g))
        if (child !== tag && registrationPaths.has(child!)) children.add(child!)
    dependencies.set(tag, [...children])
}
function getOrder(tags: string[]): string[] {
    const seen = new Set<string>()
    const order: string[] = []
    const add = (tag: string) => {
        if (seen.has(tag)) return
        seen.add(tag)
        for (const child of dependencies.get(tag) ?? []) add(child)
        const subpath = registrationPaths.get(tag)
        assert(subpath, `Stale tag in example: ${tag}`)
        order.push(subpath)
    }
    for (const tag of tags) add(tag)
    return [...new Set(order)]
}
type ClientScript = ReturnType<typeof scriptsFor>[number]
const scriptURL = (script: ClientScript) => `https://cdn.jsdelivr.net/npm/${script.package}@${script.version}/${script.path}`
function moduleFor(path: string) {
    if (!cemModules.has(path)) cemModules.set(path, { kind: 'javascript-module', path, declarations: [], exports: [] })
    return cemModules.get(path)!
}


await rm(resolve(output, 'records'), { recursive: true, force: true })
await mkdir(resolve(output, 'records'), { recursive: true })
await mkdir(resolve(output, 'assets'), { recursive: true })
const pinnedAssets = `https://cdn.jsdelivr.net/npm/${manifest.name}@${manifest.version}/ai/assets`
for (const [name, source] of Object.entries({ 'tone.wav': 'design/fixtures/tone.wav', 'studio.webm': 'design/fixtures/studio.webm', 'poster.svg': 'design/poster.svg' })) {
    await copyFile(source, resolve(output, 'assets', name))
}
for (const entry of componentDocsEntries) {
    const tag = `cb-${entry.name}`
    const klass = registered.get(tag)!
    const path = entry.name === 'modal-renderer' ? 'overlay/modal' : entry.path
    const category = path.split('/')[0]!
    const specifier = `${manifest.name}/${path}`
    const name = klass.node.id!.name
    const extra = guide[tag] ?? {}
    const docs = await readFile(`docs-cube/documentation/${entry.path}.md`, 'utf8')
    const summary = /^description:\s*"(.+)"\s*$/m.exec(docs)?.[1]
        ?? /^# .+\s*\n\s*([^\n{]+)$/m.exec(docs)?.[1]
    assert(summary, `No description in ${entry.path}`)
    const preview = /^:::component\n([\s\S]+?)\n:::/m.exec(docs)?.[1]
    assert(preview && new RegExp(`<${tag}(?:\\s|>)`).test(preview), `No usable preview for ${tag}`)
    const playground = /\(\/playground\/\?path=(\/story\/[a-z0-9-]+)\)/.exec(docs)?.[1]
    assert(playground, `No Playground reference for ${tag}`)
    const example = (extra.example ?? preview)
        .replaceAll('/assets/cube/tone.wav', `${pinnedAssets}/tone.wav`)
        .replaceAll('/assets/cube/studio.webm', `${pinnedAssets}/studio.webm`)
        .replaceAll('/assets/cube/poster.svg', `${pinnedAssets}/poster.svg`)
    const exampleTags = [...new Set(Array.from(example.matchAll(/<(cb-[\w-]+)/g), match => match[1]!))]
    const exampleEntries = getOrder(exampleTags)
    const exampleCategories = [...new Set(exampleEntries.map(entry => entry.split('/')[0]!))]
    const scripts = [...new Map(exampleCategories.flatMap(scriptsFor).map(script => [scriptURL(script), script])).values()]
    // ECharts must be ready before mounting a chart, not before the Cube runtime.
    const ordered = scripts.sort((a, b) => Number(a.package === manifest.name) - Number(b.package === manifest.name))
    await Promise.all([
        access(`dist/types/${path}/index.d.ts`),
        access(`dist/esm/${path}/index.js`),
        ...ordered.filter(script => script.package === manifest.name).map(script => access(script.path)),
    ])
    const declaration = await readFile(`dist/types/${path}/index.d.ts`, 'utf8')
    assert(new RegExp(`\\b${name}\\b`).test(declaration), `Missing declaration ${name} at ${specifier}`)

    const { properties, methods } = members(klass)
    const attributes = attributesFor(tag, properties)
    const events = eventsFor(klass)
    events.forEach(event => indexedEvents.add(event.name))
    const hooks = await hooksFor(klass)
    if (extra.rules?.accessibleNameAttributes) for (const attr of extra.rules.accessibleNameAttributes)
        assert(attributes.some(item => item.name === attr), `Stale accessible-name attribute ${tag}/${attr}`)
    const links = [
        { label: 'Component documentation', url: `${docsRoot}/documentation/${entry.path}` },
        { label: 'Cube Playground', url: `${docsRoot}/playground/?path=${playground}` },
    ]
    const component = {
        tag,
        attributes,
        properties,
        methods,
        events,
        ...hooks,
        accessibility: extra.accessibility ?? 'Use visible labels where suitable; set documented accessible names for otherwise unnamed controls.',
        composition: { relatedComponents: exampleTags.filter(other => other !== tag), renderedComponents: dependencies.get(tag) },
        rules: extra.rules,
    }
    const behavior = /data-cube-open=/.test(example)
        ? `\nfor (const opener of document.querySelectorAll('[data-cube-open]')) {
  opener.addEventListener('action', event => {
    const target = document.getElementById(opener.getAttribute('data-cube-open'))
    if (!target) return
    if (target.localName === 'cb-context-menu') {
      target.setAttribute('x', String(event.detail.originalEvent.clientX ?? 0))
      target.setAttribute('y', String(event.detail.originalEvent.clientY ?? 0))
    }
    target.setAttribute('open', 'true')
  })
}\n`
        : ''
    parseSource(behavior)
    const npmImport = exampleEntries.map(entry => `import '${manifest.name}/${entry}'`).join('\n')
    const npmExample = `${npmImport}\n\ndocument.body.insertAdjacentHTML('beforeend', \`${example.replaceAll('\\', '\\\\').replaceAll('`', '\\\`').replaceAll('${', '\\${')}\`)\n${behavior}`
    // Syntax check again after interpolation so malformed previews cannot enter the tarball.
    parseSource(npmExample)
    const id = `cube/${tag}`
    const record = {
        schemaVersion: 1, id, package: manifest.name, version: manifest.version, name: tag, summary,
        setup: {
            npm: { import: npmImport, specifier, names: [name], requires: exampleEntries.filter(entry => entry !== path).map(entry => `${manifest.name}/${entry}`), registration: 'The component import registers its own tag. Companion imports register the controls used in the example.' },
            classic: { scripts: ordered, globals: category === 'charts' ? [...globals, 'echarts'] : globals, registration: 'Each category script registers its own tags. Include the listed companion categories to register the controls used by the example.' },
        },
        component,
        example: { npm: npmExample, classic: `${ordered.map(script => `<script src="${scriptURL(script)}"></script>`).join('\n')}\n${example}\n${behavior ? `<script>${behavior}</script>\n` : ''}` },
        links,
    }
    const recordPath = `records/${tag}.json`
    indexRecords.push({ id, name: tag, summary, path: recordPath, keywords: extra.keywords ?? [entry.name.replaceAll('-', ' '), category] })
    await writeFile(resolve(output, recordPath), JSON.stringify(record, null, 2) + '\n')
    const modulePath = `dist/esm/${path}/index.js`
    const module = moduleFor(modulePath)
    module.declarations.push({
        kind: 'class', name, tagName: tag, customElement: true, description: summary,
        superclass: nameOf(klass.node.superClass) ? { name: nameOf(klass.node.superClass), module: `dist/esm/${classes.get(nameOf(klass.node.superClass)!)?.source.path.replace(/\.ts$/, '.js')}` } : undefined,
        attributes: attributes.map(item => ({ name: item.name, fieldName: item.property, type: item.type ? { text: item.type } : undefined })),
        members: [
            ...properties.map(item => ({ kind: 'field', name: item.name, attribute: item.attribute, type: item.type ? { text: item.type } : undefined, default: item.default, readonly: item.readonly })),
            ...methods.map(item => ({ kind: 'method', name: item.name, description: item.signature })),
        ],
        events: events.map(item => ({ name: item.name, type: { text: 'CustomEvent' }, description: item.detail, ...{ 'x-cube-cancelable': item.cancelable } })),
        slots: hooks.slots,
        cssParts: hooks.parts,
        cssProperties: hooks.cssProperties,
    })
    module.exports.push({ kind: 'custom-element-definition', name: tag, declaration: { name, module: modulePath } })
    module.exports.push({ kind: 'js', name, declaration: { name, module: modulePath } })
}
assert.deepEqual([...indexedEvents].sort(), [...cubeEventNames].sort(), 'The reference must account for every Storybook event')
for (const tag of Object.keys(guide)) assert(registered.has(tag), `Orphan guidance: ${tag}`)
const baseModules = new Set<string>()
for (const klass of registered.values()) for (const current of lineage(klass).slice(0, -1)) {
    const base = current.node.id?.name
    if (!base || baseModules.has(base)) continue
    baseModules.add(base)
    moduleFor(`dist/esm/${current.source.path.replace(/\.ts$/, '.js')}`).declarations.push({ kind: 'class', name: base })
}
const declarationExports = new Map<string, Set<string>>()
async function getDeclarationExports(path: string): Promise<Set<string>> {
    const target = resolve(path)
    const known = declarationExports.get(target)
    if (known) return known
    const names = new Set<string>()
    declarationExports.set(target, names)
    const text = await readFile(target, 'utf8')
    const ast = parse(text, { sourceType: 'module', plugins: [['typescript', { dts: true }]] })
    for (const statement of ast.program.body) {
        if (statement.type === 'ExportAllDeclaration' && statement.source.value.startsWith('.')) {
            const upstream = resolve(dirname(target), statement.source.value.replace(/\.js$/, '.d.ts'))
            for (const name of await getDeclarationExports(upstream)) names.add(name)
            continue
        }
        if (statement.type !== 'ExportNamedDeclaration') continue
        for (const specifier of statement.specifiers) {
            const name = nameOf(specifier.exported)
            if (name) names.add(name)
        }
        const declaration = statement.declaration
        if (declaration && 'id' in declaration) {
            const name = nameOf(declaration.id)
            if (name) names.add(name)
        }
        if (declaration?.type === 'VariableDeclaration') for (const binding of declaration.declarations) {
            const name = nameOf(binding.id)
            if (name) names.add(name)
        }
    }
    return names
}
type Export = { names: string[]; types: string[] }
type ExportPaths = { import?: string; types?: string }
async function npmExports(paths: ExportPaths, subpath: string = ''): Promise<Export | null> {
    if (!paths.import || !paths.types) return null
    const js = resolve(paths.import.replace('*', subpath))
    const declaration = resolve(paths.types.replace('*', subpath))
    await access(js)
    const names = Object.keys(await import(pathToFileURL(js).href)).sort()
    const declared = await getDeclarationExports(declaration)
    return { names, types: [...new Set([...names, ...declared])].sort() }
}
const allExports: Record<string, Export | null> = {}
for (const [key, value] of Object.entries(manifest.exports) as [string, ExportPaths | string][]) {
    if (!key.includes('*')) {
        allExports[key] = typeof value === 'object' ? await npmExports(value) : null
        continue
    }
    if (!/^\.\/[a-z-]+\/\*(?:\/base)?$/.test(key) || typeof value !== 'object') continue
    for (const entry of componentDocsEntries) {
        if (entry.name === 'modal-renderer') continue
        const [group, name] = entry.path.split('/')
        const declared = `./${group}/${name}${key.endsWith('/base') ? '/base' : ''}`
        if (key.replace('*', name!) !== declared || Object.hasOwn(allExports, declared)) continue
        allExports[declared] = await npmExports(value, name)
    }
}
for (const [key, target] of Object.entries(manifest.exports))
    if (key.includes('*') && typeof target === 'string') allExports[key] = null
for (const record of indexRecords) {
    const data = JSON.parse(await readFile(resolve(output, record.path), 'utf8'))
    const setup = data.setup.npm
    assert.equal(data.id, record.id)
    const imports = [setup.specifier, ...setup.requires]
    for (const specifier of imports) {
        const key = specifier.replace(manifest.name, '.')
        assert(allExports[key], `Example for ${record.id} uses missing npm entry ${specifier}`)
    }
    const key = setup.specifier.replace(manifest.name, '.')
    assert(setup.names.every((name: string) => allExports[key]?.names.includes(name)), `Stale npm name in ${record.id}`)
}
const buttonRecord = JSON.parse(await readFile(resolve(output, 'records/cb-button.json'), 'utf8'))
const audioRecord = JSON.parse(await readFile(resolve(output, 'records/cb-audio-player.json'), 'utf8'))
assert.deepEqual(buttonRecord.setup.classic.scripts.map((script: ClientScript) => script.path), [
    'dist/client.js', 'dist/icons-client.js', 'dist/action-client.js',
], 'Icon-only button requires the icon bundle before it renders')
assert.deepEqual(audioRecord.setup.classic.scripts.map((script: ClientScript) => script.path), [
    'dist/client.js', 'dist/icons-client.js', 'dist/action-client.js', 'dist/form-client.js', 'dist/media-client.js',
], 'Audio player requires icon, action and form controls before it renders')
assert.equal(buttonRecord.component.events.find((event: Event) => event.name === 'action')?.cancelable, false)
assert.match(buttonRecord.component.events.find((event: Event) => event.name === 'change')?.detail, /pressed/)
assert.equal(audioRecord.component.attributes.find((attribute: Attribute) => attribute.name === 'play-label')?.property, 'playLabel')
const workspaceRecord = JSON.parse(await readFile(resolve(output, 'records/cb-workspace.json'), 'utf8'))
assert.deepEqual(workspaceRecord.component.slots.map((slot: Slot) => slot.name), ['', 'bottom', 'end', 'header', 'start'])
const browser = [...sources].filter(([path]) => /^(?:[a-z-]+-)?client\.ts$/.test(path)).map(([sourcePath, source]) => {
    const provided: string[] = []
    visit(source.ast, node => {
        if (node.type !== 'AssignmentExpression' || memberName(node.left) !== 'CUBE' || node.right.type !== 'ObjectExpression') return
        for (const property of node.right.properties) {
            if (isObjectProperty(property) && nameOf(property.key)) provided.push(`BFS.CUBE.${nameOf(property.key)}`)
        }
    })
    return { path: `dist/${sourcePath.replace(/\.ts$/, '.js')}`, globals: provided.sort(), requires: [{ package: '@beforesemicolon/web-component', path: 'dist/client.js' }] }
})
const skill = { name: 'beforesemicolon-cube', path: 'skills/beforesemicolon-cube/SKILL.md' }
const skillSource = await readFile(skill.path, 'utf8')
assert.match(skillSource, /^---\nname: beforesemicolon-cube\ndescription: [^\n]+\n---\n/, 'The package skill must have matching installation metadata')
const index = {
    schemaVersion: 1, package: manifest.name, version: manifest.version,
    repository: 'https://github.com/beforesemicolon/cube',
    records: indexRecords.sort((a, b) => a.id.localeCompare(b.id, 'en')),
    exports: allExports, browser, skill,
    customElementsManifest: '../custom-elements.json',
    themeTokens: 'tokens.json',
}
await writeFile(resolve(output, 'index.json'), JSON.stringify(index, null, 2) + '\n')
await writeFile(resolve(output, 'tokens.json'), JSON.stringify({ schemaVersion: 1, package: manifest.name, version: manifest.version, light: flattenTheme(cubeTheme, 'light'), dark: flattenTheme(cubeTheme, 'dark') }, null, 2) + '\n')
const cemPath = resolve(output, '..', 'custom-elements.json')
await writeFile(cemPath, JSON.stringify({ schemaVersion: '1.0.0', readme: 'README.md', modules: [...cemModules.values()] }, null, 2) + '\n')
console.log(`${index.records.length} versioned Cube reference records and Custom Elements Manifest generated.`)
