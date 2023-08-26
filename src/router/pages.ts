import {Page} from "../types";
import {searchParamsToJson} from "./utils/search-params-to-json";

const routeListeners: Set<(current: string, prev: string) => void> = new Set();
const pages: Array<Page> = [
	{
		path: "/", options: {
			title: document.title,
			state: {},
			search: searchParamsToJson(location.search)
		}
	}
];

let prevPath: string = location.pathname;

// init pages on load
if (location.pathname !== "/") {
	pages.push({
		path: location.pathname, options: {
			title: document.title,
			state: {},
			search: searchParamsToJson(location.search)
		}
	})
}

const broadcast = () => {
	routeListeners.forEach(cb => {
		cb(location.pathname, prevPath)
	})
}

window.addEventListener("popstate", (e) => {
	const beforeLastPath = pages[pages.length - 2];
	
	const wentBack = location.pathname == (beforeLastPath?.path || "/");
	
	if (wentBack) {
		pages.pop();
	} else {
		pages.push({
			path: location.pathname,
			options: {
				state: e.state,
				title: document.title ?? '',
				search: searchParamsToJson(location.search)
			}
		})
	}
	
	broadcast();
})

export default {
	get length() {
		return pages.length;
	},
	subscribe(sub: (current: string, prev: string) => void) {
		routeListeners.add(sub);
		sub(location.pathname, pages[pages.length - 1]?.path);
		
		return () => {
			routeListeners.delete(sub);
		}
	},
	add(newPage: Page) {
		prevPath = location.pathname;
		
		if (prevPath !== location.href) {
			pages.push(newPage);
			
			window.history.pushState(newPage.options.state, newPage.options.title ?? document.title, newPage.path);
			
			// keep max 50 entries
			if (pages.length > 50) {
				pages.shift();
			}
			
			broadcast();
		}
	},
	replace(newPage: Page) {
		prevPath = location.pathname;
		
		if (prevPath !== location.href) {
			pages[pages.length - 1] = newPage;
			
			window.history.replaceState(newPage.options.state, newPage.options.title ?? document.title, newPage.path);
			
			// keep max 50 entries
			if (pages.length > 50) {
				pages.shift();
			}
			
			broadcast();
		}
	},
	previous() {
		if (pages.length) {
			prevPath = location.pathname;
			window.history.back();
		}
	}
}
