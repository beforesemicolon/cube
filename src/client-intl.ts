import initIntl from './localization';

// @ts-ignore
if (window.BFS.Cube) {
	// @ts-ignore
	const intl = initIntl(window.BFS.Cube)
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			// @ts-ignore
			...(window.BFS.Cube || {}),
			intl
		}
	}
} else {
	throw new Error('Failed to initialize cube-intl.')
}
