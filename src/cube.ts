import {turnKebabToCamelCasing} from "./utils/turn-kebab-to-camel-casing";
import {turnCamelToKebabCasing} from "./utils/turn-camel-to-kebab-casing";
import {jsonParse} from "./utils/json-parse";
import {JSONToCSS} from "./utils/json-to-css";
import {getStyleString} from "./utils/get-style-string";
import {element, ElementInterface} from "./element";

export interface StylesheetObject {
	[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}
export type Stylesheet = StylesheetObject | string;
export type Renderer<P> = (props: P) => void;
export type ShadowRootMode = "open" | "closed";
export type RegisterComponentCallback<P> = () => ({
	tagName: string;
	mode: ShadowRootMode;
	delegatesFocus: boolean;
	createElement: () => ElementInterface
})
export interface StyleControl<S> {
	update: (data: Partial<S>) => void;
	load: (shadow: ShadowRoot | HTMLElement) => void;
}
export interface ComponentOptions {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
}
export function Cube<P extends Record<string, any>, S extends Record<string, any>>(
	renderer: Renderer<P>,
	props: P = {} as P,
	stylesheet?: (data: S) => Stylesheet
): RegisterComponentCallback<P> {
	const tagName = turnCamelToKebabCasing(renderer.name || "");
	
	if (!tagName) {
	    throw new Error("Component render function must have a name")
	}
	
	return ({mode = "open", delegatesFocus = false}: ComponentOptions = {}) => {
		createComponentClass<P, S>(tagName, {
			mode,
			delegatesFocus,
			renderer,
			props,
			stylesheet
		});
		
		return {
			tagName,
			mode,
			delegatesFocus,
			createElement: () => element(tagName),
		}
	}
}


let currentComponent: {} | null = null;

export const onMount = (cb: () => void) => {
	if (currentComponent) {
		Object.defineProperty(currentComponent, "mount", {
			get() {
				return cb;
			},
		})
	}
}

export const onDestroy = (cb: () => void) => {
	if (currentComponent) {
		Object.defineProperty(currentComponent, "destroy", {
			get() {
				return cb;
			},
		})
	}
}

export const onAdoption = (cb: () => void) => {
	if (currentComponent) {
		Object.defineProperty(currentComponent, "adoption", {
			get() {
				return cb;
			},
		})
	}
}

export const onUpdate = (cb: (name: string, newValue: unknown, oldValue: unknown) => void) => {
	if (currentComponent) {
		Object.defineProperty(currentComponent, "update", {
			get() {
				return cb;
			},
		})
	}
}

export const Style = (styleProps?: {}) => {
	// @ts-ignore
	const control = currentComponent?.styleControl;
	
	control.update(styleProps);
	
	return control
}

export const EventDispatch = <Data>() => {
	// @ts-ignore
	const dispatchEvent = currentComponent.dispatchEvent;
	
	return <T>(eventName: string, detail?: T) => {
		dispatchEvent(new CustomEvent(eventName, {
			detail
		}))
	}
}

export const template = (stringParts: TemplateStringsArray, ...values: unknown[]): Record<string, ElementInterface> => {
	if (currentComponent) {
		let htmlString = stringParts
			.map((s, i) => `${s}${values[i] || ""}`)
			.join("")
			.trim();
		const frag = document.createDocumentFragment();
		const el = document.createElement("div");
		el.innerHTML = htmlString.trim();
		el.childNodes.forEach(n => {
			frag.appendChild(n)
		})
		
		// @ts-ignore
		currentComponent.element = frag;
		
		return Array.from(frag.querySelectorAll('[ref]')).reduce((acc, n) => {
			const refName = n.getAttribute("ref");
			n.removeAttribute("ref");
			
			if (refName) {
				acc[refName] = element(n as HTMLElement);
			}
			
			return acc
		}, {} as Record<string, ElementInterface>);
	}
	
	return {}
}

function createComponentClass<P extends Record<string, any>, S extends Record<string, any>>(tagName: string, {
	delegatesFocus = false,
	mode = "open",
	props,
	renderer,
	stylesheet
}: {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
	props: P,
	renderer: Renderer<P>;
	stylesheet?: (data: S) => Stylesheet;
}) {
	const CLS = customElements.get(tagName);
	
	if (!CLS) {
		class WebComponent extends HTMLElement {
			// @ts-ignore
			static observedAttributes: Array<string> = Object.keys(props).map(turnCamelToKebabCasing);
			static readonly tagName = tagName;
			#shadowRoot: ShadowRoot | HTMLElement;
			#props = structuredClone(props);
			#handlers = {
				destroy: () => {},
				mount: () => {},
				adoption: () => {},
				update: (name: string, newValue: unknown, oldValue: unknown) => {},
				styleControl: {
					update: this.updateStyle.bind(this),
					detach: this.detachStyle.bind(this),
					attach: this.attachStyle.bind(this),
					reset: this.resetStyle.bind(this),
				},
				dispatchEvent: (e: CustomEvent) => {
					this.dispatchEvent(e)
				},
				element: document.createDocumentFragment()
			}
			#styleElement?: HTMLStyleElement;
			#previousStyleData: S = {} as S;
			
			getStyle(data: S) {
				this.#previousStyleData = {...this.#previousStyleData, ...data};
				let style: Stylesheet = "";
				
				if (typeof stylesheet === "function") {
					style = stylesheet(structuredClone(this.#previousStyleData));
					
					if (style) {
						style = typeof style === 'object'
							? `<style class="${tagName.toLowerCase()}">${JSONToCSS(style, tagName, true)}</style>`
							: getStyleString(style, tagName.toLowerCase(), true);
					}
				}
				
				return style;
			}
			
			updateStyle(data: Partial<S>) {
				const style = this.getStyle(data as S);
				
				if (this.#styleElement) {
					const div = document.createElement("div");
					div.innerHTML = style
					this.#styleElement.innerHTML = div.children[0].innerHTML;
				}
			}
			detachStyle() {
				if (this.#styleElement) {
					this.#styleElement.remove();
				}
			}
			attachStyle() {
				if (this.#styleElement) {
					this.#shadowRoot.prepend(this.#styleElement)
				}
			}
			resetStyle() {
				this.#previousStyleData = {} as S;
				this.updateStyle({});
			}
			
			constructor() {
				super();
				
				Object.keys(this.#props).forEach((key) => {
					Object.defineProperty(this, key, {
						get() {
							return this.#props[key];
						},
						set(newValue: any) {
							const oldValue = this.#props[key];
							
							if (newValue !== oldValue) {
								this.#props[key as keyof P] = newValue;
								this.#handlers.update(key, this.#props[key], oldValue);
							}
						}
					})
				});
				
				this.#shadowRoot = this.attachShadow({mode, delegatesFocus});
			}
			
			async connectedCallback() {
				this.#shadowRoot.innerHTML = "";
				
				currentComponent = this.#handlers;
				// todo freeze props but allow to be dynamically read
				renderer(this.#props);
				currentComponent = null;
				
				const style = this.getStyle({} as S);
				
				if (style) {
					this.#shadowRoot.innerHTML = style;
					this.#styleElement = this.#shadowRoot.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
				}
				
				this.#shadowRoot.appendChild(this.#handlers.element);
				
				this.#handlers.mount();
			}
			
			async disconnectedCallback() {
				this.#handlers.destroy();
			}
			
			async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
				const propName = turnKebabToCamelCasing(name);
				
				if (!newValue && typeof props[propName] === 'boolean') {
					newValue = this.hasAttribute(name);
				}
				
				// @ts-ignore
				this[propName] = jsonParse(newValue);
			}
			
			async adoptedCallback() {
				this.#handlers.adoption();
			}
		}
		
		return customElements.define(tagName, WebComponent);
	}
}
