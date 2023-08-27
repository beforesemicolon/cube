import {when, repeat, html, element, HtmlTemplate} from '@beforesemicolon/html';

import {
	register,
	onMount,
	onDestroy,
	onAdoption,
	template,
	eventDispatch,
	useValue,
	host,
	onUpdate,
	globalConfig,
	useContext,
	createContext,
	onContextUpdate
} from "./cube";

if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			register,
			globalConfig,
			onMount,
			onDestroy,
			onAdoption,
			onUpdate,
			onContextUpdate,
			useContext,
			createContext,
			template,
			eventDispatch,
			useValue,
			host,
			// @bfs/html
			when,
			repeat,
			html,
			element,
			HtmlTemplate
		}
	}
}
