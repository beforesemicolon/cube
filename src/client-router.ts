import initRouter, {goToPage, replacePage, previousPage, nextPage, onPageChange, isOnPage} from './router';
import {TC} from './utils';

// @ts-ignore
if (window) {
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
			TC
		}
	}
	
	// @ts-ignore
	initRouter(window.BFS.Cube)
}
