import { Component, type CommonProps } from '../../core/Component.js'
import { text } from '../../core/value.js'
import { cubeTheme, flattenTheme, type Appearance, type ThemeDefinition } from '../tokens.js'
export interface ThemeProviderProps extends CommonProps { src?: string; theme?: ThemeDefinition | null; appearance?: Appearance }
export abstract class ThemeProviderBase extends Component<ThemeProviderProps> {
    static observedAttributes = [...Component.observedAttributes, 'src', 'theme', 'appearance']
    src = ''; theme: ThemeDefinition | null = null; appearance: Appearance = 'system'
    private loadController?: AbortController
    private revision = 0
    private loaded: unknown = cubeTheme
    private original = new Map<string, [string, string]>()
    private query?: MediaQueryList
    protected mount(): void {
        this.query = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
        if (this.query) this.listen(this.query, 'change', () => this.apply())
        this.load()
    }
    protected update(name: string): void { if (name === 'src' || name === 'theme') this.load(); else this.apply() }
    protected unmount(): void { this.revision++; this.loadController?.abort(); this.restore() }
    private restore(): void {
        for (const [name, [value, priority]] of this.original) {
            if (value) this.style.setProperty(name, value, priority); else this.style.removeProperty(name)
        }
        this.original.clear()
    }
    private apply(): void {
        if (!this.mounted) return
        try {
            const mode = this.appearance === 'dark' || (this.appearance !== 'light' && this.query?.matches) ? 'dark' : 'light'
            const values = flattenTheme(this.loaded, mode)
            this.restore()
            this.original.set('color-scheme',[this.style.getPropertyValue('color-scheme'),this.style.getPropertyPriority('color-scheme')])
            this.style.setProperty('color-scheme',mode)
            for (const [name, value] of Object.entries(values)) {
                this.original.set(name, [this.style.getPropertyValue(name), this.style.getPropertyPriority(name)])
                this.style.setProperty(name, value)
            }
            this.emit('cb-theme-change', { appearance: mode, theme: this.loaded })
        } catch (error) { this.onError(error) }
    }
    private load(): void {
        const rev = ++this.revision
        this.loadController?.abort()
        const src = text(this.src).trim()
        if (!src) { this.loaded = this.theme ?? cubeTheme; this.apply(); return }
        this.loadController = new AbortController()
        const signal = this.loadController.signal
        void (async () => {
            const url = new URL(src, this.baseURI)
            if (!['https:', 'http:', 'blob:'].includes(url.protocol)) throw new TypeError('Unsupported theme URL')
            const response = await fetch(url, { signal, credentials: 'omit' })
            if (!response.ok) throw new Error(`Theme request returned ${response.status}`)
            const theme: unknown = await response.json()
            flattenTheme(theme, 'light'); flattenTheme(theme, 'dark')
            if (this.mounted && rev === this.revision) { this.loaded = theme; this.apply() }
        })().catch(error => { if (!signal.aborted && rev === this.revision) this.onError(error) })
    }
}
