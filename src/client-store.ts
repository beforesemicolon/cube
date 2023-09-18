import {store, listStore} from './store';

// @ts-ignore
if (window.BFS.Cube) {
// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			// @ts-ignore
			...(window.BFS.Cube || {}),
			store,
			listStore
		}
	}
} else {
	throw new Error('Failed to initialize cube-store.')
}
