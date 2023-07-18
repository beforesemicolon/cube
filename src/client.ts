import {when, repeat, html} from '@beforesemicolon/html';
import {register, onMount, onDestroy, onAdoption, onAfterUpdate, onBeforeUpdate, style, template, eventDispatch} from "./cube";

if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		register,
		onMount,
		onDestroy,
		onAdoption,
		onAfterUpdate,
		onBeforeUpdate,
		style,
		template,
		eventDispatch,
		when,
		repeat,
		html
	}
}
