export interface CssNumericValue { readonly number: string; readonly unit: string }
export interface CssFunctionValue { readonly name: 'min' | 'max' | 'clamp'; readonly arguments: readonly string[] }

/** Retain the author's numeric spelling while separating its optional unit. */
export function cssNumericValue(value: string): CssNumericValue | null {
    const match = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(%|[a-z]+)?$/iu.exec(value.trim())
    return match && match[2]?.toLowerCase() !== 'e' ? { number: match[1]!, unit: match[2] || '' } : null
}

/** Split only top-level commas; nested math, variables and quoted strings round-trip. */
export function cssFunctionValue(value: string): CssFunctionValue | null {
    const match = /^(min|max|clamp)\(([\s\S]*)\)$/u.exec(value.trim())
    if (!match) return null
    const name = match[1] as CssFunctionValue['name'], body = match[2]!, args: string[] = []
    let start = 0, depth = 0, quote = '', escaped = false, comment = false
    for (let index = 0; index < body.length; index++) {
        const char = body[index]!, next = body[index + 1]
        if (comment) { if (char === '*' && next === '/') { comment = false; index++ }; continue }
        if (escaped) { escaped = false; continue }
        if (char === '\\') { escaped = true; continue }
        if (quote) { if (char === quote) quote = ''; continue }
        if (char === '/' && next === '*') { comment = true; index++; continue }
        if (char === '"' || char === "'") quote = char
        else if (char === '(') depth++
        else if (char === ')') { if (--depth < 0) return null }
        else if (char === ',' && depth === 0) { args.push(body.slice(start, index).trim()); start = index + 1 }
    }
    if (depth || quote || comment || escaped) return null
    args.push(body.slice(start).trim())
    if (name === 'clamp' && args.length !== 3 || name !== 'clamp' && args.length < 2) return null
    return { name, arguments: args }
}
