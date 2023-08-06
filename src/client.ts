import {when, repeat, html, element, HtmlTemplate} from '@beforesemicolon/html';
import {register, onMount, onDestroy, onAdoption, template, eventDispatch, useValue, host} from "./cube";

if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			register,
			onMount,
			onDestroy,
			onAdoption,
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
