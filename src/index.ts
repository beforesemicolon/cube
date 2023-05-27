export * from "./cube";
export * from "./element";
import {Cube} from "./cube";
import {element} from "./element";

if (window) {
	// @ts-ignore
	window.CUBE = {
		Cube,
		element,
	}
}
