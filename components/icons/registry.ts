import { iconPaths as originalIconPaths } from './paths.js'
import { mediaIconPaths } from '../media/icons.js'
import { tablerIconPaths } from './tabler.js'
import { bootstrapIconPaths, evenOddBootstrapIcons } from './bootstrap.js'

const kebabCase = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/** Synonyms stay accepted at runtime, but never appear as additional catalog entries. */
const synonyms: Readonly<Record<string, string>> = {
    "box-arrow-up-right": "external",
    "edit": "pencil",
    "envelope": "mail",
    "exclamation-triangle": "warning",
    "funnel": "filter",
    "users": "people",
    "settings": "gear",
    "attributes": "sliders",
    "review-star": "star",
    "arrow": "arrow-right",
    "calendar2": "calendar",
    "calendar3": "calendar",
    "check2": "check",
    "check2-circle": "check-circle",
    "check2-square": "check-square",
    "chevron-down": "down",
    "chevron-left": "left",
    "chevron-right": "right",
    "dark": "moon",
    "light": "sun",
    "eye-slash": "eye-off",
    "file-earmark": "file",
    "floppy": "save",
    "fonts": "text",
    "globe2": "globe",
    "grip-vertical": "drag",
    "info-circle": "info",
    "link-45deg": "link",
    "list-ul": "list",
    "paperclip": "attachment",
    "person-plus": "user-add",
    "plus-lg": "plus",
    "question-circle": "help",
    "sticky": "sticky-note",
    "star-outline": "star",
    "folder-plus": "folder-add",
    "system": "circle-half",
    "x": "close",
    "x-lg": "close",
    "speedometer2": "gauge"
}

const rawPaths: Record<string, string> = { ...originalIconPaths, ...mediaIconPaths, ...tablerIconPaths, ...bootstrapIconPaths }
const definitions: Record<string, string> = {}
for (const [name, path] of Object.entries(rawPaths)) {
    const canonical = kebabCase(name)
    if (!synonyms[canonical]) definitions[canonical] = path
}

export const iconPaths: Record<string, string> = {}
export const filledIconNames = new Set<string>()
export const iconViewBoxes: Record<string, string> = {}
export const iconFillRules: Record<string, 'evenodd' | 'nonzero'> = {}
const aliases: Record<string, string> = {}
const signatures = new Map<string, string>()
for (const [name, path] of Object.entries(definitions)) {
    const filled = Object.hasOwn(bootstrapIconPaths, name)
    const viewBox = filled ? '0 0 16 16' : '0 0 24 24'
    const fillRule = evenOddBootstrapIcons.has(name) ? 'evenodd' : 'nonzero'
    const signature = `${viewBox}:${filled}:${fillRule}:${path.replace(/\s+/g, '')}`
    const previous = signatures.get(signature)
    if (previous) { aliases[name] = previous; continue }
    signatures.set(signature, name)
    iconPaths[name] = path
    iconViewBoxes[name] = viewBox
    iconFillRules[name] = fillRule
    if (filled) filledIconNames.add(name)
}

for (const name of [...Object.keys(rawPaths), ...Object.keys(synonyms)]) {
    let canonical = kebabCase(name)
    while (synonyms[canonical] || aliases[canonical]) canonical = synonyms[canonical] ?? aliases[canonical]!
    if (!Object.hasOwn(iconPaths, canonical)) throw new Error(`Missing icon alias target: ${name} -> ${canonical}`)
    if (name !== canonical) aliases[name] = canonical
}

export const iconAliases: Readonly<Record<string, string>> = aliases
export function canonicalIconName(name: string): string {
    return iconAliases[name] ?? iconAliases[kebabCase(name)] ?? kebabCase(name)
}

// Existing property lookups remain compatible without duplicating Object.keys/entries.
for (const [alias, canonical] of Object.entries(iconAliases)) {
    if (!Object.hasOwn(iconPaths, alias)) Object.defineProperty(iconPaths, alias, {
        enumerable: false,
        get: () => iconPaths[canonical],
    })
}
