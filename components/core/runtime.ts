import type * as Runtime from '@beforesemicolon/web-component'

/** The rendering engine is supplied by the application, shared by every Cube category. */
export type CubeRuntime = Pick<typeof Runtime,
    'WebComponent' | 'HtmlTemplate' | 'html' | 'css' | 'state' | 'effect' | 'element' |
    'repeat' | 'when' | 'is' | 'isNot' | 'and' | 'or' | 'val' | 'pick' | 'unsafeHTML'>

export let WebComponent: CubeRuntime['WebComponent']
export let html: CubeRuntime['html']
export let css: CubeRuntime['css']
export let state: CubeRuntime['state']
export let effect: CubeRuntime['effect']
export let element: CubeRuntime['element']
export let repeat: CubeRuntime['repeat']
export let when: CubeRuntime['when']
export let is: CubeRuntime['is']
export let isNot: CubeRuntime['isNot']
export let and: CubeRuntime['and']
export let or: CubeRuntime['or']
export let val: CubeRuntime['val']
export let pick: CubeRuntime['pick']
export let unsafeHTML: CubeRuntime['unsafeHTML']
export let HtmlTemplate: CubeRuntime['HtmlTemplate']
export type { HtmlTemplate as Template } from '@beforesemicolon/web-component'

let initialized: CubeRuntime | undefined

export function currentRuntime(): CubeRuntime | undefined { return initialized }

export function initializeRuntime(runtime: CubeRuntime): void {
    if (initialized) {
        if (initialized.WebComponent !== runtime.WebComponent || initialized.html !== runtime.html) {
            throw new Error('Cube categories must share the same WebComponent runtime.')
        }
        return
    }
    initialized = runtime
    ;({ WebComponent, HtmlTemplate, html, css, state, effect, element, repeat, when,
        is, isNot, and, or, val, pick, unsafeHTML } = runtime)
}

interface BrowserRuntime {
    readonly WebComponent?: CubeRuntime['WebComponent']
    readonly MARKUP?: Omit<CubeRuntime, 'WebComponent' | 'css'>
    readonly css?: CubeRuntime['css']
}

export function browserRuntime(): CubeRuntime {
    const browser = globalThis as typeof globalThis & { BFS?: BrowserRuntime }
    const runtime = browser.BFS
    if (!runtime?.WebComponent || !runtime.MARKUP?.html || !runtime.css) {
        throw new Error('Load @beforesemicolon/web-component/dist/client.js before a Cube client script.')
    }
    return { ...runtime.MARKUP, WebComponent: runtime.WebComponent, css: runtime.css }
}
