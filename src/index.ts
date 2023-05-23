export * from "./cube";
export * from "./update-element-key";
import {Cube} from "./cube";
import {updateElementKey} from "./update-element-key";

if (window) {
	// @ts-ignore
	window.CUBE = {
		Cube,
		updateElementKey,
	}
}
