import {isSamePath} from "./utils/is-same-path";
import {PathOptions} from "../types";
import pages from './pages';

export const goToPage = (path: string, {title = document.title, state = {}, search = {}}: PathOptions = {}) => {
	if (!isSamePath(path)) {
		const url = new URL(path, location.origin);
		
		for (let key in search) {
			if (search.hasOwnProperty(key)) {
				console.log('-- ', key, search);
				url.searchParams.set(key, search[key])
			}
		}
		
		pages.add({path, options: {title, state, search}});
	}
}
