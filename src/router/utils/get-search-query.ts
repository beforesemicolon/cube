import { jsonParse } from '@beforesemicolon/markup/dist/utils'
import { ObjectLiteral } from '../../types'

export const getSearchQuery = <T extends Record<string, string>>(): T => {
    const searchParams = new URLSearchParams(window.location.search)
    const res: ObjectLiteral = {}

    for (const key of searchParams.keys()) {
        const val = searchParams.get(key)
        res[key] = val ? jsonParse(val) : null
    }

    return res as T
}
