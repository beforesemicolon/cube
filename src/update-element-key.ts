import booleanAttributes from './utils/boolean-attributes.json';
import {jsonParse} from "./utils/json-parse";

export const updateElementKey = (element: Element | Node, key: string, value: unknown) => {
	// @ts-ignore
	const componentCls = customElements.get(element.tagName?.toLowerCase() ?? "");
	
	if (componentCls) {
		const updated = updateText(element, key, value);
		
		if (!updated) {
			// @ts-ignore
			element[key] = value;
		}
		
		return;
	}
	
	if (key in booleanAttributes || typeof value === 'boolean') {
		if (value) (element as Element).setAttribute(key, '');
		else (element as Element).removeAttribute(key);
	} else {
		(element as Element).setAttribute(key, jsonParse(String(value)));
	}
};

function updateText(element: Element | Node, key: string, value: unknown) {
	if (element instanceof Text || /text|textContent|nodeValue/.test(key)) {
		if (/text|textContent/.test(key)) {
			element.textContent = String(value);
		} else {
			element.nodeValue = String(value);
		}
		return true;
	}
	
	return false;
}
