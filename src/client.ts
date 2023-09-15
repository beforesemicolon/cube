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
	onDOMUpdate,
	onError,
	useContext,
	createContext,
	onContextUpdate
} from "./cube";
import {TC} from './utils';
import {config, updateConfig} from './config';

if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		Cube: {
			TC,
			register,
			config,
			updateConfig,
			onMount,
			onDestroy,
			onAdoption,
			onUpdate,
			onDOMUpdate,
			onError,
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
