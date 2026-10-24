import type * as Runtime from '@beforesemicolon/web-component'

/** Module imports use the installed package; browser factories receive this runtime from BFS. */
export type CubeRuntime = Pick<typeof Runtime,
    'WebComponent' | 'HtmlTemplate' | 'html' | 'css' | 'state' | 'effect' | 'element' |
    'repeat' | 'when' | 'is' | 'isNot' | 'and' | 'or' | 'oneOf' | 'val' | 'pick' | 'unsafeHTML'>

export {
    WebComponent, HtmlTemplate, html, css, state, effect, element, repeat, when,
    is, isNot, and, or, oneOf, val, pick, unsafeHTML,
} from '@beforesemicolon/web-component'
export type { HtmlTemplate as Template } from '@beforesemicolon/web-component'
