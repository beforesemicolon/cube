import initIntl from './localization'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window.BFS.Cube) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const intl = initIntl(window.BFS.Cube)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BFS = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(window.BFS || {}),
        Cube: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...(window.BFS.Cube || {}),
            intl,
        },
    }
} else {
    throw new Error('Failed to initialize cube-intl.')
}
