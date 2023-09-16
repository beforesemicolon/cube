import initIntl from './localization';
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
			TC,
		}
	}
	
	// @ts-ignore
	initIntl(window.BFS.Cube)
}
