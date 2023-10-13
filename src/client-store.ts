import { store, listStore } from './store'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window.BFS.Cube) {
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
            store,
            listStore,
        },
    }
} else {
    throw new Error('Failed to initialize cube-store.')
}
