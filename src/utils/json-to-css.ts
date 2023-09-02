import {turnCamelToKebabCasing} from "@beforesemicolon/html/dist/utils";
import {replaceCssHost} from "./replace-css-host";
import {StylesheetObject} from "../types";

type callback = (str: string | null, declaration?: string) => void

export function JSONToCSS(obj: Record<string, any>, tagName: string, hasShadowRoot: boolean = true) {
	const css = Object.keys(obj).map(prop => createPropertyBody(prop, obj[prop])).join('').trim();
	
	if (!hasShadowRoot) {
	   return replaceCssHost(css, tagName);
	}
	
	return css;
}

function getPropertyCSS(prop: string, value: StylesheetObject | number | string | Record<string, any>, parentProp: string, cb: callback) {
	prop = prop.trim();
	
	value = typeof value === "number" ? value + 'px' : value;
	
	if(prop.startsWith('&')) {
		cb(null, createPropertyBody(prop.replace(/&/g, parentProp), value as Record<string, any>));
	} else if(prop.startsWith('@')) {
		cb(null, createPropertyBody(prop, value as Record<string, any>))
	} else if(typeof value === 'object') {
		if (parentProp.startsWith('@')) {
			cb(createPropertyBody(prop, value))
		} else if(/^[^+~>]/i.test(prop)) {
			const selector = parentProp
				.split(',')
				.map(pp => prop.split(',').map(p => `${pp.trim()} ${p.trim()}`).join(', '))
				.join(', ')
				.trim();

			cb(null, createPropertyBody(selector, value))
		}
	} else if(prop.startsWith('--')) { // CSS variables
		cb(`${prop}: ${value};`);
	} else {
		cb(`${turnCamelToKebabCasing(prop)}: ${value};`);
	}
}

function createPropertyBody(prop: string, value: Record<string, any>): string {
	const declarations = [];
	let declaration = `${prop} {`;
	
	Object.keys(value).forEach(childProp => getPropertyCSS(childProp, value[childProp], prop, (pair, newDeclaration = '') => {
		if(pair) {
			declaration += pair;
		} else {
			declarations.push(newDeclaration);
		}
	}));
	
	declaration += '} ';
	
	declarations.unshift(declaration);
	
	return declarations.join('');
}
