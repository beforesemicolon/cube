import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)

export interface HighlightedCode { language: string; html: string }
export function highlightCode(source: string, requestedLanguage: string): HighlightedCode {
    const requested = requestedLanguage.toLowerCase()
    const language = hljs.getLanguage(requested) ? requested : 'plaintext'
    return { language, html: language === 'plaintext' ? '' : hljs.highlight(source, { language, ignoreIllegals: true }).value }
}
