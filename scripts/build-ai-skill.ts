import assert from 'node:assert/strict'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { posix, resolve } from 'node:path'
import { parse } from '@babel/parser'
import { componentDocsEntries, componentGroups } from './component-entries.js'

type Item = { name: string; type?: string; property?: string; values?: string[]; default?: string; signature?: string; readonly?: boolean; cancelable?: boolean; detail?: string; bubbles?: boolean; composed?: boolean }
type Record = {
    id: string; name: string; version: string; summary: string
    setup: { npm: { import: string; specifier: string; names: string[] }; classic: { scripts: { package: string; version: string; path: string }[] } }
    component: { attributes: Item[]; properties: Item[]; methods: Item[]; events: Item[]; slots: Item[]; parts: Item[]; cssProperties: Item[]; accessibility: string; composition: { relatedComponents: string[]; renderedComponents: string[] } }
    example: { npm: string; classic: string }
}
type RecordExports = { [subpath: string]: { names: string[]; types: string[] } | null }

const skillName = 'beforesemicolon-cube'
const folder = 'skills/' + skillName
const docsRoot = 'docs-cube/documentation'
const guideMap = new Map([['index.md', 'references/setup.md'], ['theme.md', 'references/theming.md'], ['get-started.md', 'references/setup.md'], ['build-with-ai.md', 'SKILL.md']])
const componentMap = new Map(componentDocsEntries.map(entry => [entry.path + '.md', 'references/components/' + entry.path + '.md']))
const cleanDirs = ['references/components', 'references/categories', 'examples/components']
const fixtureFiles = ['tone.wav', 'studio.webm', 'poster.svg'] as const
const inline = (s: string) => '\x60' + s.replaceAll('\x60', '\\x60') + '\x60'
const fence = (lang: string, code: string) => '\x60\x60\x60' + lang + '\n' + code.trim() + '\n\x60\x60\x60\n'
const heading = (group: string) => group.split('-').map(s => s[0]?.toUpperCase() + s.slice(1)).join(' ')
const localAssets = (s: string) => s.replace(/(?:https:\/\/cdn\.jsdelivr\.net\/npm\/@beforesemicolon\/cube@[^/]+\/ai\/assets|\/assets\/cube)\/(tone\.wav|studio\.webm|poster\.svg)/g, '../assets/$1')

function section(title: string, items: string[]) {
    if (!items.length) return ''
    return '## ' + title + '\n\n' + items.map(item => '- ' + item).join('\n') + '\n\n'
}
function localLink(page: string, target: string, label: string) {
    return '[' + label + '](' + posix.relative(posix.dirname(page), target) + ')'
}
function table(columns: string[], lines: string[][]) {
    if (!lines.length) return ''
    const row = (items: string[]) => '| ' + items.map(item => item.replaceAll('|', '\\|').replaceAll('\n', ' ')).join(' | ') + ' |\n'
    return row(columns) + row(columns.map(() => '---')) + lines.map(row).join('') + '\n'
}

export async function buildCubeSkill(version: string, exports: RecordExports, tokens: unknown) {
    const files = new Map<string, string>()
    const binary = new Set<string>()
    const coverage: { [recordId: string]: string } = {}
    const categories = new Map<string, { record: Record; path: string }[]>()
    const english = JSON.parse(await readFile('docs-cube/locale/en.json', 'utf8')) as unknown
    const rewriteDoc = (text: string, old: string, page: string) => {
        return text.replace(/^---\n[\s\S]*?\n---\n/, '')
            .replace(/\{\{t\.([\w.]+)\}\}/g, (_, key: string) => {
                let found = english
                for (const field of key.split('.')) found = (found as { [field: string]: unknown } | null)?.[field]
                assert(typeof found === 'string', 'Unresolved localized text: ' + old + ':' + key)
                return found
            })
            .replace(/^:::component\n([\s\S]+?)\n:::/gm, (_match, code: string) => fence('html', localAssets(code)))
            .replace(/\]\(([^)\s]+)\)/g, (match, href: string) => {
                if (/^https?:\/\//.test(href) || href.startsWith('#')) return match
                if (href.startsWith('/playground')) return '](https://cube.beforesemicolon.com' + href + ')'
                const [raw, fragment] = href.split('#')
                const target = raw?.startsWith('/documentation')
                    ? raw.replace(/^\/documentation\/?/, '').replace(/\/$/, '') || 'index'
                    : posix.normalize(posix.join(posix.dirname(old), raw!))
                const source = target.endsWith('.md') ? target : target + '.md'
                const next = componentMap.get(source) ?? guideMap.get(source)
                assert(next, 'Unmapped docs link in ' + old + ': ' + href)
                return '](' + posix.relative(posix.dirname(page), next) + (fragment ? '#' + fragment : '') + ')'
            })
            .trim() + '\n'
    }
    for (const entry of componentDocsEntries) {
        const tag = 'cb-' + entry.name
        const category = entry.path.split('/')[0]!
        const record = JSON.parse(await readFile('ai/records/' + tag + '.json', 'utf8')) as Record
        assert.equal(record.id, 'cube/' + tag)
        assert.equal(record.version, version)
        const page = componentMap.get(entry.path + '.md')!
        coverage[record.id] = page
        const npm = 'examples/components/' + tag + '.mjs'
        const html = 'examples/components/' + tag + '.html'
        const c = record.component
        const preview = record.example.classic.replace(/^<script src="[^"]+"><\/script>\n/gm, '')
        const scripts = record.setup.classic.scripts.map(script => '<script defer src="https://cdn.jsdelivr.net/npm/' + script.package + '@' + script.version + '/' + script.path + '"></script>')
        const article = rewriteDoc(await readFile(docsRoot + '/' + entry.path + '.md', 'utf8'), entry.path + '.md', page)
        // The exact authored preview remains in the component page. The
        // runnable samples add the correct dependencies and preview behavior.
        const articleBody = article.replace(/^# [^\n]+\n+/, '')
        const relates = [...new Set([...c.composition.relatedComponents, ...c.composition.renderedComponents])]
        const API = [
            section('Npm setup', ['Own subpath: ' + inline(record.setup.npm.specifier) + '.', 'Public element export: ' + record.setup.npm.names.map(inline).join(', ') + '.']),
            fence('js', record.setup.npm.import),
            section('Classic browser setup (in order)', record.setup.classic.scripts.map(s => inline(s.package + '@' + s.version + '/' + s.path))),
            section('Composition', [
                ...relates.map(name => {
                    const target = componentDocsEntries.find(candidate => name === 'cb-' + candidate.name)
                    assert(target, 'Unknown composition tag ' + name)
                    return localLink(page, componentMap.get(target.path + '.md')!, name)
                }),
                ...(c.slots.length ? ['Use the slots listed below. Slot names belong to the element receiving the content.'] : ['This example uses the component API rather than assuming named slots.']),
            ]),
            '## Accessible use\n\n' + c.accessibility + ' Preserve native keyboard behavior. Check the control has a useful accessible name and test its relevant focus and keyboard interaction.\n\n',
            c.attributes.length ? '## Observed HTML attributes\n\n' + table(['Attribute', 'Property', 'Type or accepted literals'], c.attributes.map(x => [inline(x.name), x.property ? inline(x.property) : '—', x.values?.length ? x.values.map(inline).join(', ') : x.type ? inline(x.type) : '—'])) : '',
            c.properties.length ? '## Public properties\n\n' + table(['Property', 'Type', 'Default'], c.properties.map(x => [inline(x.name) + (x.readonly ? ' (read-only)' : ''), x.type ? inline(x.type) : '—', x.default ? inline(x.default) : '—'])) : '',
            section('Public methods', c.methods.map(x => inline(x.signature ?? x.name))),
            c.events.length ? '## Events\n\n' + table(['Event', 'Detail', 'Behavior'], c.events.map(x => [inline(x.name), x.detail ? inline(x.detail) : '—', [x.bubbles && 'bubbles', x.composed && 'composed', x.cancelable && 'cancelable'].filter(Boolean).join(', ') || '—'])) : '',
            section('Slots', c.slots.map(x => x.name ? inline(x.name) : 'Default slot')),
            section('CSS parts', c.parts.map(x => inline('::part(' + x.name + ')'))),
            section('CSS custom properties used', c.cssProperties.map(x => inline(x.name))),
        ].join('\n')
        files.set(page,
            '# ' + tag + ' · Cube ' + version + '\n\n' +
            localLink(page, 'references/categories/' + category + '.md', heading(category) + ' components') + '\n\n' +
            '**Examples:** ' + localLink(page, npm, 'Npm browser entry') + ' · ' + localLink(page, html, 'Standalone classic HTML') + '\n\n' +
            articleBody + '\n' + API +
            '\nAttributes come from the registered constructor. Methods, event detail, slots and parts are taken from the sources; variants can render different hooks. Use the example and public API instead of relying on a private shadow tree.\n'
        )
        const npmCode = localAssets(record.example.npm)
        parse(npmCode, { sourceType: 'module' })
        files.set(npm, npmCode)
        // Preview scripts run after deferred category scripts have upgraded the elements.
        const content = localAssets(preview).replace(/<script>([\s\S]*?)<\/script>/g, (_, code: string) => {
            parse(code, { sourceType: 'script' })
            return '<script>document.addEventListener("DOMContentLoaded", () => {\n' + code.trim() + '\n})</script>'
        })
        files.set(html, '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + tag + ' example</title>\n' + scripts.join('\n') + '\n</head>\n<body>\n' + content.trim() + '\n</body>\n</html>\n')
        const group = categories.get(category) ?? []
        group.push({ record, path: page })
        categories.set(category, group)
    }
    assert.deepEqual([...categories.keys()].sort(), [...componentGroups].sort(), 'Every public category needs a skill page')
    const overview = 'references/index.md'
    files.set(overview, '# Cube ' + version + ' offline documentation\n\n' +
        'Start with [setup](setup.md), [theming](theming.md), [recipes](recipes.md), [utility signatures](utilities.md), or the [entry-point catalog](public-exports.md). Follow one category and component page per task. All component pages include npm and classic browser examples.\n\n' +
        '## Component categories\n\n' +
        componentGroups.map(group => '- ' + localLink(overview, 'references/categories/' + group + '.md', heading(group)) + ' (' + categories.get(group)!.length + ')').join('\n') + '\n')
    for (const [category, entries] of categories) {
        const page = 'references/categories/' + category + '.md'
        files.set(page, '# ' + heading(category) + ' · Cube ' + version + '\n\n' +
            '[All categories](../index.md) · [Setup](../setup.md) · [Theming](../theming.md)\n\n' +
            table(['Component', 'Use it to'], entries.sort((a,b) => a.record.name.localeCompare(b.record.name,'en')).map(({ record, path }) => [localLink(page, path, record.name), record.summary])))
    }
    for (const source of ['index.md', 'theme.md']) {
        const page = guideMap.get(source)!
        const body = rewriteDoc(await readFile(docsRoot + '/' + source, 'utf8'), source, page)
        files.set(page, body +
            (source === 'theme.md'
                ? '\nOpen the [token values](theme-tokens.json) for both appearances. Use a declared variable or part at the narrowest app scope.\n'
                : '\nRead the [example guide](recipes.md) for local scripts and example files. The [catalog](index.md) includes all component groups.\n'))
    }
    files.set('references/theme-tokens.json', JSON.stringify(tokens, null, 2) + '\n')
    files.set('references/public-exports.md', '# Public entry points · Cube ' + version + '\n\n' +
        'Use the individual component pages for examples and types. These names come from the built npm modules and declarations, not documentation guesses. Type imports are not runtime registrations. Wildcard assets have no named exports.\n\n' +
        table(['Public subpath', 'JavaScript names', 'Declaration-only names'], Object.entries(exports).map(([path, meta]) => [
            inline(path),
            meta ? meta.names.map(inline).join(', ') : 'Static asset',
            meta ? (meta.types.filter(name => !meta.names.includes(name)).map(inline).join(', ') || '—') : '—',
        ])))
    const groups = [
        ['Modal service', './overlay', 'overlay/modal/service'],
        ['Flashbar service', './feedback', 'feedback/flashbar/service'],
        ['Range and selection helpers', '.', 'form/model'],
        ['Masked input helpers', './form', 'form/masked-input/mask'],
        ['Chart engine', './charts', 'charts/engine'],
        ['Chart model helpers', './charts', 'charts/model'],
        ['Playback utilities', '.', 'media/controller'],
        ['Icon registry', './icons', 'icons/registry'],
        ['Theme utilities', './theme', 'theme/tokens'],
        ['Color helpers', './styling', 'styling/color-picker/color'],
        ['Gradient helpers', './styling', 'styling/gradient-editor/gradient'],
    ] as const
    const utilities = []
    for (const [title, importPath, file] of groups) {
        const code = await readFile('dist/types/' + file + '.d.ts', 'utf8')
        const publicNames = new Set(exports[importPath]?.names)
        const ast = parse(code, { sourceType: 'module', plugins: [['typescript', { dts: true }]] })
        const declarations = ast.program.body.flatMap(node => {
            if (node.type !== 'ExportNamedDeclaration' || !node.declaration) return []
            const actual = node.declaration
            if (actual.type === 'TSInterfaceDeclaration' || actual.type === 'TSTypeAliasDeclaration')
                return [code.slice(node.start!, node.end!)]
            const identifiers = actual.type === 'VariableDeclaration'
                ? actual.declarations.flatMap(item => item.id.type === 'Identifier' ? [item.id.name] : [])
                : ('id' in actual && actual.id?.type === 'Identifier' ? [actual.id.name] : [])
            return identifiers.some(name => publicNames.has(name)) ? [code.slice(node.start!, node.end!)] : []
        })
        assert(declarations.length, 'No public declaration data: ' + file)
        utilities.push('## ' + title + '\n\n' + 'Import from ' + inline('@beforesemicolon/cube' + (importPath === '.' ? '' : importPath.slice(1))) + '.\n\n' +
            fence('ts', declarations.join('\n\n')))
    }
    files.set('references/utilities.md', '# Cube utility signatures · ' + version + '\n\n' +
        'See the [implementation recipes](recipes.md) for usage examples. These are signature excerpts from the exact built release. Imports not shown inside excerpts are resolved by the original package declarations.\n\n' + utilities.join('\n'))
    const recipes = 'references/recipes.md'
    files.set(recipes, await readFile(resolve(folder, recipes), 'utf8'))
    files.set('SKILL.md', await readFile(resolve(folder, 'SKILL.md'), 'utf8'))
    // Check links relative to the installed skill folder, not the checkout.
    for (const fixture of fixtureFiles) binary.add('examples/assets/' + fixture)
    for (const [path, code] of files) if (path.endsWith('.md')) for (const [, href] of code.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (!href || /^(https?:|mailto:|#)/.test(href)) continue
        const linked = posix.normalize(posix.join(posix.dirname(path), href.split('#')[0]!))
        assert(files.has(linked) || binary.has(linked), 'Missing offline skill file: ' + path + ' -> ' + href)
    }
    assert.equal(componentDocsEntries.length, [...files.keys()].filter(path => path.startsWith('references/components/')).length)
    for (const path of cleanDirs) await rm(resolve(folder, path), { recursive: true, force: true })
    for (const [path, contents] of files) {
        const target = resolve(folder, path)
        await mkdir(posix.dirname(target), { recursive: true })
        if (path !== 'SKILL.md' && path !== recipes) await writeFile(target, contents)
    }
    await mkdir(resolve(folder, 'examples/assets'), { recursive: true })
    for (const fixture of fixtureFiles) await copyFile(resolve('ai/assets', fixture), resolve(folder, 'examples/assets', fixture))
    const manifest = { schemaVersion: 1, name: skillName, files: [...new Set([...files.keys(), ...binary])].sort(), coverage }
    await writeFile(resolve(folder, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
    console.log('Offline Cube skill: ' + componentDocsEntries.length + ' component pages, ' + categories.size + ' categories, ' + componentDocsEntries.length * 2 + ' examples, ' + manifest.files.length + ' files.')
    return { name: skillName, path: folder + '/SKILL.md', manifest: folder + '/manifest.json' }
}
