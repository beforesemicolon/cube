import {isSamePath} from "./utils/is-same-path";

const routeListeners: Set<(pathname: string) => void> = new Set();
const entryPath = location.pathname;

const broadcast = () => {
	routeListeners.forEach(cb => {
		cb(location.pathname)
	})
}

window.addEventListener("popstate", (e) => {
	broadcast();
})

export default {
	get entryPath() {
		return entryPath;
	},
	subscribe(sub: (pathname: string) => void) {
		routeListeners.add(sub);
		sub(location.pathname);
		
		return () => {
			routeListeners.delete(sub);
		}
	},
	add(pathname: string, state: Record<string, unknown> = {}, title = document.title) {
		if (!isSamePath(pathname)) {
			window.history.pushState(state, title, pathname);
			
			if (title !== document.title) {
				document.title = title;
			}
			
			broadcast();
		}
	},
	replace(pathname: string, state: Record<string, unknown> = {}, title = document.title) {
		if (!isSamePath(pathname)) {
			window.history.replaceState(state, title, pathname);
			
			if (title !== document.title) {
				document.title = title;
			}
			
			broadcast();
		}
	},
	previous() {
		window.history.back();
	},
	next() {
		window.history.forward();
	}
}
