import {Cube} from "./types";
import * as cube from "./cube";
import initRouter from "./router";

initRouter(cube as unknown as Cube);

export * from "./cube";
export * from "./types";
export {replacePage, goToPage, goToPreviousPage} from "./router";
export {when, repeat, html, HtmlTemplate, element} from '@beforesemicolon/html';
