import {Cube} from "../types";

export * from './go-to-previous-page';
export * from './go-to-page';
export * from './replace-page';
import initWithRoute from './components/with-route';
import initPageLink from './components/page-link';

export default (cube: Cube) => {
	initWithRoute(cube)
	initPageLink(cube)
}

