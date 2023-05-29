import booleanAttributes from "./utils/boolean-attributes.json";
import {isPrimitive} from "./utils/is-primitive";
import {jsonStringify} from "./utils/json-stringify";
import {resolveHtmlEntities} from "./utils/resolve-html-entities";
import {turnCamelToKebabCasing} from "./utils/turn-camel-to-kebab-casing";

export interface ElementInterface {
	self: () => HTMLElement;
	text: (value?: string) => string | null | ElementInterface;
	toHtml: () => string;
	html: (value?: string) => string | ElementInterface;
	attr: (name: string, value?: any) => string | null | ElementInterface;
	prop: (name: string, value?: any) => string | null | ElementInterface;
	class: (value?: string) => string | ElementInterface;
	id: (value?: string) => string | ElementInterface;
	style: (property: keyof CSSStyleDeclaration, value: string | null) => string | CSSStyleDeclaration;
	parent: () => ElementInterface | null;
	children: () => ElementInterface[];
	prepend: (node: Node) => ElementInterface;
	append: (node: Node) => ElementInterface;
	replaceWith: (node: HTMLElement) => ElementInterface;
	insertAt: (node: Node, order: number) => ElementInterface;
	find: (selector: string) => ElementInterface[];
	siblings: () => ElementInterface[];
	prev: () => ElementInterface | null;
	next: () => ElementInterface | null;
	on: (eventName: string, handler?: EventListenerOrEventListenerObject | CustomEventListener<unknown>) => ElementInterface;
	off: (eventName: string) => ElementInterface;
}

interface CustomEventListener<D> {
	(evt: CustomEvent<D>): void;
}

export const element = (tagNameOrElement: string | HTMLElement, content = ""): ElementInterface => {
	let eventHandlers: Record<string, EventListenerOrEventListenerObject | CustomEventListener<unknown>> = {};
	let el = typeof tagNameOrElement === "string" ? document.createElement(tagNameOrElement) : tagNameOrElement;
	
	if (content) {
		el.innerHTML = content;
	}
	
	const isComponent = () => customElements.get(el.tagName.toLowerCase())
	
	return {
		self() {
			return el
		},
		toHtml() {
			return el.outerHTML
		},
		text(value?: string) {
			if (value === undefined) {
			   return el.textContent
			}
			
			el.textContent = String(value);
			return this;
		},
		html(value?: string) {
			if (value === undefined) {
				return el.innerHTML
			}
			
			el.innerHTML = resolveHtmlEntities(value);
			return this;
		},
		find(selector: string) {
			if (el.shadowRoot) {
				return Array.from(el.shadowRoot.querySelectorAll(selector), n => element(n as HTMLElement))
			}
			
			return Array.from(el.querySelectorAll(selector), n => element(n as HTMLElement))
		},
		parent() {
			if (el.parentNode instanceof ShadowRoot) {
				return el.parentNode.host ? element(el.parentNode.host as HTMLElement) : null
			}
			
			return el.parentNode ? element(el.parentNode as HTMLElement) : null
		},
		attr(name: string, value?: any) {
			if (value === undefined) {
				return el.getAttribute(name);
			}
			
			if (name in booleanAttributes || typeof value === 'boolean') {
				if (value) el.setAttribute(name, '');
				else el.removeAttribute(name);
			} else {
				el.setAttribute(name, isPrimitive(value) ? String(value) : jsonStringify(value));
			}
			return this;
		},
		prop(name: string, value?: any) {
			if (value === undefined) {
				// @ts-ignore
				return el[name];
			}
			
			// @ts-ignore
			el[name] = value;
			return this;
		},
		class(value?: string) {
			if (value === undefined) {
			    return el.className;
			}
			
			el.className = value;
			return this;
		},
		id(value?: string) {
			if (value === undefined) {
				return el.id;
			}
			
			el.id = value;
			return this;
		},
		style(property?: keyof CSSStyleDeclaration, value?: string | null) {
			if (!property) {
			   return el.style;
			}
			
			property = turnCamelToKebabCasing(property as string) as keyof CSSStyleDeclaration;
			
			if (value === null) {
				el.style.removeProperty(property as string);
			} else {
				el.style.setProperty(property as string, value as string);
			}
			
			return el.style.getPropertyValue(property as string);
		},
		children() {
			return Array.from(el.children, n => element(n as HTMLElement));
		},
		siblings() {
			if (el.parentNode && el.parentNode.children.length) {
			    return Array.from(el.parentNode.children, n => element(n as HTMLElement)).filter(sib => sib.self() !== el)
			}
			
			return [];
		},
		prev() {
			return el.previousElementSibling ? element(el.previousElementSibling as HTMLElement) : null;
		},
		next() {
			return el.nextElementSibling ? element(el.nextElementSibling as HTMLElement) : null;
		},
		replaceWith(node: HTMLElement) {
			el.replaceWith(node);
			el = node;
			for (let eventHandlersKey in eventHandlers) {
				this.on(eventHandlersKey, eventHandlers[eventHandlersKey])
			}
			
			return this;
		},
		prepend(node: Node) {
			el.prepend(node)
			return this;
		},
		append(node: Node) {
			el.appendChild(node)
			return this;
		},
		insertAt(node: Node, position: number) {
			const childAtPos = el.children[position];
			
			if (childAtPos) {
				el.insertBefore(node, childAtPos)
			}
			
			return this;
		},
		on(eventName: string, handler?: EventListenerOrEventListenerObject | CustomEventListener<unknown>) {
			if (handler) {
				eventHandlers[eventName] = handler;
				el.addEventListener(eventName, handler as EventListenerOrEventListenerObject);
			}
			
			return this;
		},
		off(eventName: string) {
			if (eventHandlers[eventName]) {
				el.removeEventListener(eventName, eventHandlers[eventName] as EventListenerOrEventListenerObject);
			}
			
			return this;
		}
	}
}

const btn = element("button", "<slot></slot>");
