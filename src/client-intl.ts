import initIntl from './localization';

// @ts-ignore
if (window) {
// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			// @ts-ignore
			...(window.BFS.Cube || {}),
		}
	}
	
	// @ts-ignore
	initIntl(window.BFS.Cube)
}
