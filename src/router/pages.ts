import { isOnPage } from './utils/is-on-page'
import { getSearchQuery } from './utils/get-search-query'
import { jsonStringify } from '@beforesemicolon/html/dist/utils'
import { TC } from '../utils'
import { ObjectLiteral } from '../types'

const routeListeners: Set<
    (pathname: string, query: Record<string, string>) => void
> = new Set()

const broadcast = async () => {
    routeListeners.forEach((cb) => {
        cb(location.pathname, getSearchQuery())
    })
}

window.addEventListener('popstate', () => {
    broadcast()
})

export const onPageChange = (sub: (pathname: string) => void) => {
    routeListeners.add(sub)
    sub(location.pathname)

    return () => {
        routeListeners.delete(sub)
    }
}

export const goToPage = (
    pathname: string,
    state: ObjectLiteral = {},
    title = document.title
) => {
    if (!isOnPage(pathname)) {
        window.history.pushState(state, title, pathname)

        if (title !== document.title) {
            document.title = title
        }

        broadcast()
    }
}

export const replacePage = (
    pathname: string,
    state: ObjectLiteral = {},
    title = document.title
) => {
    if (TC.string(pathname) && !isOnPage(pathname)) {
        window.history.replaceState(state, title, pathname)

        if (title !== document.title) {
            document.title = title
        }

        broadcast()
    }
}

export const previousPage = () => {
    window.history.back()
}

export const nextPage = () => {
    window.history.forward()
}

export const updateSearchQuery = (query: ObjectLiteral | null) => {
    if (query === null) {
        window.history.replaceState(
            history.state,
            document.title,
            location.pathname
        )
    } else {
        const searchParams = new URLSearchParams(window.location.search)

        for (const queryKey in query) {
            searchParams.set(queryKey, jsonStringify(query[queryKey]))
        }

        window.history.replaceState(
            history.state,
            document.title,
            location.pathname + `?${searchParams.toString()}`
        )
    }

    broadcast()
}
