export * from "./cube";
export * from "./element";
export * from "./repeat";
import {Cube} from "./cube";
import {element} from "./element";

if (window) {
	// @ts-ignore
	window.CUBE = {
		Cube,
		element,
	}
}
