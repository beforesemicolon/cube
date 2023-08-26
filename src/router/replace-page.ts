import {isSamePath} from "./utils/is-same-path";
import pages from './pages';
import {PathOptions} from "../types";

export const replacePage = (path: string, {title = document.title, state = {}, search = {}}: PathOptions = {}) => {
	if (!isSamePath(path)) {
		const url = new URL(path, location.origin);
		
		for (let key in search) {
			if (search.hasOwnProperty(key)) {
				url.searchParams.set(key, search[key])
			}
		}
		
		pages.replace({path, options: {title, state, search}});
	}
}
