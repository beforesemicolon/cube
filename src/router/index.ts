import {Cube} from "../types";
import initWithRoute from './components/with-route';
import initPageLink from './components/page-link';
import pages from "./pages";

export const goToPage = pages.add;
export const replacePage = pages.replace;
export const previousPage = pages.previous;
export const nextPage = pages.next;

export default (cube: Cube) => {
	initWithRoute(cube)
	initPageLink(cube)
}
