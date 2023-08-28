import {Cube} from "./types";
import * as cube from "./cube";
import initRouter from "./router";

initRouter(cube as unknown as Cube);

export * from "./types";
export * from "./cube";
export * from "./store";
export {replacePage, goToPage, previousPage, nextPage} from "./router";
export {when, repeat, html, HtmlTemplate, element} from '@beforesemicolon/html';
