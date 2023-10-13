import initRouter, {
    goToPage,
    replacePage,
    previousPage,
    nextPage,
    onPageChange,
    isOnPage,
} from './router'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window.BFS.Cube) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BFS = {
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(window.BFS || {}),
        Cube: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...(window.BFS.Cube || {}),
            goToPage,
            replacePage,
            previousPage,
            nextPage,
            onPageChange,
            isOnPage,
        },
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    initRouter(window.BFS.Cube)
} else {
    throw new Error('Failed to initialize cube-router.')
}
