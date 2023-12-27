import { jsonParse } from '@beforesemicolon/web-component'
import { ObjectLiteral } from '@beforesemicolon/web-component'

export const getSearchQuery = <T extends Record<string, string>>(): T => {
    const searchParams = new URLSearchParams(window.location.search)
    const res: ObjectLiteral = {}

    for (const key of searchParams.keys()) {
        const val = searchParams.get(key)
        res[key] = val ? jsonParse(val) : null
    }

    return res as T
}
