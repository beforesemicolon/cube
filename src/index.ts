export * from "./cube";
export * from "./element";
import {register, onMount, onDestroy, onAdoption, Style, template, EventDispatch} from "./cube";
import {element} from "./element";

if (window) {
	// @ts-ignore
	window.CUBE = {
		register,
		onMount, onDestroy, onAdoption,
		Style, template, EventDispatch,
		element,
	}
}
