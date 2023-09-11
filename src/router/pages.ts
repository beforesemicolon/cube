import {isOnPage} from "./utils/is-on-page";

const routeListeners: Set<(pathname: string) => void> = new Set();

const broadcast = async () => {
	routeListeners.forEach(cb => {
		cb(location.pathname)
	})
}

window.addEventListener("popstate", (e) => {
	broadcast();
})

export const onPageChange = (sub: (pathname: string) => void) =>{
	routeListeners.add(sub);
	sub(location.pathname);
	
	return () => {
		routeListeners.delete(sub);
	}
};

export const goToPage = (pathname: string, state: Record<string, unknown> = {}, title = document.title) => {
	if (!isOnPage(pathname)) {
		window.history.pushState(state, title, pathname);
	
		if (title !== document.title) {
			document.title = title;
		}
		
		broadcast();
	}
}

export const replacePage = (pathname: string, state: Record<string, unknown> = {}, title = document.title) => {
	if (!isOnPage(pathname)) {
		window.history.replaceState(state, title, pathname);
		
		if (title !== document.title) {
			document.title = title;
		}
		
		broadcast();
	}
}

export const previousPage = () => {
	window.history.back();
}

export const nextPage = () => {
	window.history.forward();
}
