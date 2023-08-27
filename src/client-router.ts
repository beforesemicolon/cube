import initRouter, {goToPage, replacePage, goToPreviousPage} from './router';

// @ts-ignore
if (window) {
// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			// @ts-ignore
			...(window.BFS.Cube || {}),
			goToPage, replacePage, goToPreviousPage
		}
	}
	
	// @ts-ignore
	initRouter(window.BFS.Cube)
}
