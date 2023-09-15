import {Cube} from "../types";
import initWithRoute from './components/with-route';
import initPageLink from './components/page-link';
export * from "./pages";
export * from "./utils/is-on-page";
export * from "./utils/get-search-query";

export default (cube: Cube) => {
	initWithRoute(cube)
	initPageLink(cube)
}
