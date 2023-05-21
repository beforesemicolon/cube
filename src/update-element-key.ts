import booleanAttributes from './utils/boolean-attributes.json';

export const updateElementKey = (element: Element | Node, key: string, value: unknown) => {
	// @ts-ignore
	if (customElements.get(element.tagName?.toLowerCase() ?? "")) {
		// @ts-ignore
		element[key] = value;
		return;
	}
	
	if(element instanceof Text || /text|textContent|nodeValue/.test(key)) {
		if (/text|textContent/.test(key)) {
			element.textContent = String(value);
		} else {
			element.nodeValue = String(value);
		}
	}
	
	if (key in booleanAttributes || typeof value === 'boolean') {
		if (value) (element as Element).setAttribute(key, '');
		else (element as Element).removeAttribute(key);
	} else {
		(element as Element).setAttribute(key, String(value));
	}
};
