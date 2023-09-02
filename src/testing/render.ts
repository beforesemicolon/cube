import {element, HtmlTemplate} from "@beforesemicolon/html";
import {register} from "../cube";
import {ComponentOptions, FnComponent, ShadowRootMode, Style} from "../types";

const defaultOptions: ComponentOptions = {
	mode: ShadowRootMode.OPEN,
	delegatesFocus: false
}

beforeEach(() => {
	// @ts-ignore
	jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
});

afterEach(() => {
	(window.requestAnimationFrame as jest.Mock).mockRestore();
});

export const render = <P extends Record<string, any>>(
	el: Element | HTMLElement | Node | HtmlTemplate | string | FnComponent<P>,
	props: P = {} as P,
	styleOrOptions: Style<P> | ComponentOptions = {},
	opt: ComponentOptions = defaultOptions) => {
	document.body.innerHTML = '';
	let target: Element | null = null;
	
	if (typeof el === 'function') {
		const {tagName} = register<P>(el, props, styleOrOptions, opt);
		
		target = element(tagName);
		document.body.appendChild(target);
	} else if (el instanceof HtmlTemplate) {
		el.render(document.body)
	} else if (typeof el === 'string') {
		document.body.innerHTML = el;
	} else if (el instanceof Node) {
		document.body.appendChild(el);
		target = el instanceof HTMLElement ? el : null;
	}
	
	return {
		target,
		toString() {
			return target ? target.outerHTML : document.body.innerHTML
		},
		get content() {
			return target ? (target.shadowRoot ?? target).innerHTML : document.body.innerHTML
		},
		find(cssSelector: string) {
			if (cssSelector.trim().length) {
				if (target) {
					return Array.from((target.shadowRoot ?? target).querySelectorAll(cssSelector));
				}
				
				return Array.from(document.querySelectorAll(cssSelector));
			}
			
			return [];
		}
	}
}
