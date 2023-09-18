import initRouter, {goToPage, replacePage, previousPage, nextPage, onPageChange, isOnPage} from './router';

// @ts-ignore
if (window.BFS.Cube) {
// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			// @ts-ignore
			...(window.BFS.Cube || {}),
			goToPage,
			replacePage,
			previousPage,
			nextPage,
			onPageChange,
			isOnPage,
		}
	}
	
	// @ts-ignore
	initRouter(window.BFS.Cube)
} else {
	throw new Error('Failed to initialize cube-router.')
}
