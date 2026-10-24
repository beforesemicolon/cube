import { record } from '../core/value.js'
export type Appearance = 'light' | 'dark' | 'system'
export interface ThemeDefinition {
    schemaVersion: string
    name: string
    tokens: Record<string, unknown> & { color: Record<string, unknown> }
}
export function flattenTheme(input: unknown, appearance: 'light' | 'dark'): Record<string, string> {
    const theme = record(input)
    if (theme.schemaVersion !== '1.0' || typeof theme.name !== 'string' || !Object.keys(record(record(theme.tokens).color)).length)
        throw new TypeError('Expected a site-builder ThemeDefinitionV1 with a color token group')
    const output: Record<string, string> = Object.create(null)
    const seen = new Set<object>()
    let count = 0
    const key = (part: string) => part.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
    const visit = (node: unknown, path: string[], depth: number): void => {
        if (depth > 16 || ++count > 4096) throw new TypeError('Theme is too large')
        if (node === null || node === undefined || Array.isArray(node)) return
        if (typeof node === 'object') {
            if (seen.has(node)) throw new TypeError('Cyclic theme')
            seen.add(node)
            const r = record(node), keys = Object.keys(r)
            const mode = keys.includes('default') && (keys.includes('light') || keys.includes('dark'))
                && keys.every(k => ['default', 'light', 'dark'].includes(k))
            if (mode) {
                const value = Object.hasOwn(r, appearance) ? r[appearance] : r.default
                if (!['string', 'number', 'boolean'].includes(typeof value)) throw new TypeError('Invalid theme mode value')
                visit(value, path, depth + 1)
            } else {
                const scale = keys.includes('DEFAULT') && keys.every(k => k === 'DEFAULT' || /^[1-9]\d*$/.test(k))
                for (const k of keys) {
                    if (!/^[A-Za-z0-9_-]+$/.test(k) || ['__proto__', 'constructor', 'prototype'].includes(k)) throw new TypeError('Unsafe token name')
                    visit(r[k], scale && k === 'DEFAULT' ? path : [...path, key(k)], depth + 1)
                }
            }
            seen.delete(node)
            return
        }
        if (!['string', 'number', 'boolean'].includes(typeof node) || (typeof node === 'number' && !Number.isFinite(node))) throw new TypeError('Invalid theme scalar')
        const value = String(node)
        // Themes are tokens, not a mechanism for injecting stylesheets or network requests.
        if (/[;{}\u0000-\u001f]/.test(value) || /url\s*\(|expression\s*\(|@import/i.test(value)) throw new TypeError('Unsafe theme value')
        const name = '--' + path.join('-')
        if (Object.hasOwn(output, name)) throw new TypeError('Token names collide after normalization')
        output[name] = value
    }
    visit(theme.tokens, [], 0)
    return output
}
const mode = (light: string, dark: string) => ({ default: light, dark })
export const cubeTheme: ThemeDefinition = {
    schemaVersion: '1.0', name: 'cube', tokens: {
        color: {
            background: mode('#F2F3F2', '#141719'), surface: mode('#FFFFFF', '#1D2124'),
            surfaceMuted: mode('#F5F6F5', '#282E32'), foreground: mode('#20262B', '#F3F6F8'),
            mutedForeground: mode('#606B73', '#A6B2BC'), border: mode('#8A959F', '#7C8B97'),
            separator: mode('#DAE0E4', '#3B454D'), primary: mode('#2563EB', '#83B6FF'),
            primaryForeground: mode('#FFFFFF', '#14243D'), focus: mode('#2563EB', '#83B6FF'),
            selection: mode('#EAF1FF', '#213B5B'), danger: mode('#B4233C', '#FF8A9A'),
            dangerForeground: mode('#FFFFFF', '#141719'), warning: mode('#855700', '#F5C765'),
            success: mode('#08764F', '#62D6A7'), active: mode('#E8ECEE','#38424A'), surfaceRaised: mode('#FFFFFF','#343C42'), signalText: mode('#1D50B3','#9BC5FF'), primaryHover: mode('#1D50B3','#9BC5FF'), dangerSoft: mode('#FFF0F2','#48272D'), track: mode('#D8DCDE', '#414A51'),
        },
        typography: { body: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', lineHeight: '1.5' }, mono: { fontFamily: 'ui-monospace, monospace' } },
        spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
        radius: { sm: '6px', md: '10px', lg:'12px' }, motion: { duration: { fast: '100ms', normal: '160ms' } },
        component: {
            field: {
                background: mode('#FFFFFF', '#242424'),
                hover: mode('#FFFFFF', '#292929'),
                border: mode('#D6D6D6', '#505050'),
                borderHover: mode('#B5B5B5', '#707070'),
                radius: '8px',
            },
            fontSize:'12px',lineHeight:'1.4',title:{fontSize:'14px'},caption:{fontSize:'11px'},icon:{size:'16px'},control: { height: '28px',heightXs:'24px',heightSm:'28px',heightMd:'36px',heightLg:'44px' }, slider:{minWidth:'80px',trackHeight:'4px',thumbSize:'12px'}, chart: { height: '320px', fontSize: '12px',swatchSize:'10px',swatchRadius:'2px' }, media: { aspectRatio: '16 / 9',volumeWidth:'72px',volumeCompactWidth:'48px',rateWidth:'72px',captionsWidth:'128px',fullscreenBackground:mode('#0F1113','#08090A') }, modal:{width:'560px',radius:'12px',shadow:'0 24px 70px rgba(12,18,24,.24)'},overlay:{backdrop:'rgba(10,16,22,.56)',blur:'1px'},disabled:{opacity:'.5'} },
        zIndex: { dropdown: '40', overlay: '80', flashbar: '90', tooltip: '100' },
        custom: { chart: { series: { '1': mode('#2563EB', '#83B6FF'), '2': mode('#08764F', '#62D6A7'), '3': mode('#855700', '#F5C765'), '4': mode('#8A37A3', '#DBA5ED'), '5': mode('#B4233C', '#FF8A9A'), '6': mode('#007B8F', '#6CD9E6') } } },
    },
}
export const lightTokens = flattenTheme(cubeTheme, 'light')
export const darkTokens = flattenTheme(cubeTheme, 'dark')
export const token = (name: string): string => `var(${name}, ${lightTokens[name] ?? 'inherit'})`
