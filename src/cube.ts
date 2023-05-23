import {turnKebabToCamelCasing} from "./utils/turn-kebab-to-camel-casing";
import {turnCamelToKebabCasing} from "./utils/turn-camel-to-kebab-casing";
import {jsonParse} from "./utils/json-parse";
import {JSONToCSS} from "./utils/json-to-css";
import {getStyleString} from "./utils/get-style-string";
import {Mode} from "fs";

export interface StylesheetObject {
	[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}
export interface CubeElement extends HTMLElement {
	onMount: (cb: () => void) => void;
	onUpdate: (cb: (name: string, newValue: unknown, oldValue: unknown) => void) => void;
	onDestroy: (cb: () => void) => void;
	onAdoption: (cb: () => void) => void;
}
export type CubeComponent<P> = CubeElement & P;
export type Stylesheet = StylesheetObject | string;
export type RenderElement = HTMLElement | DocumentFragment;
export type Renderer<P> = (props: P) => RenderElement;
export type ShadowRootMode = "open" | "closed" | "none";
export type RegisterComponentCallback<P> = () => ({
	tagName: string;
	mode: Mode;
	delegatesFocus: boolean;
	createElement: () => CubeComponent<P>
})
export interface ComponentOptions {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
}
export function Cube<P extends Record<string, any>>(
	renderer: Renderer<P>,
	props: P = {} as P,
	stylesheet: Stylesheet = ""
): RegisterComponentCallback<P> {
	const tagName = turnCamelToKebabCasing(renderer.name || "");
	
	if (!tagName) {
	    throw new Error("Component render function must have a name")
	}
	
	return ({mode = "open", delegatesFocus = false}: ComponentOptions = {}) => {
		createComponentClass(tagName, {
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
			createElement: () => {
				return document.createElement(tagName) as CubeComponent<P>;
			},
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

function createComponentClass<P extends Record<string, any>>(tagName: string, {
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
	stylesheet?: Stylesheet;
}) {
	const CLS = customElements.get(tagName);
	
	if (!CLS) {
		class WebComponent extends HTMLElement {
			// @ts-ignore
			static observedAttributes: Array<string> = Object.keys(props).map(turnCamelToKebabCasing);
			static readonly tagName = tagName;
			#shadowRoot: ShadowRoot | HTMLElement;
			#element: Element | DocumentFragment | null = null;
			#props = JSON.parse(JSON.stringify(props)); // todo: use structured clone
			#handlers = {
				destroy: () => {},
				mount: () => {},
				adoption: () => {},
				update: (name: string, newValue: unknown, oldValue: unknown) => {},
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
				
				if (mode !== "none") {
					this.#shadowRoot = this.attachShadow({mode, delegatesFocus});
				} else {
					this.#shadowRoot = this;
				}
			}
			
			async connectedCallback() {
				const noElement = this.#element === null;
				
				if (noElement || this.isConnected) {
					currentComponent = this.#handlers;
					// todo freeze props but allow to be dynamically read
					let element = renderer(this.#props);
					currentComponent = null;
					this.#element = element;
					
					if (noElement) {
						let style = "";
						
						if (stylesheet) {
							style = typeof stylesheet === 'object'
								? `<style class="${tagName}">${JSONToCSS(stylesheet, tagName, true)}</style>`
								: getStyleString(stylesheet, tagName, true);
						}
						
						if (mode === "none") {
							document.head.insertAdjacentHTML("beforeend", style)
						} else {
							this.#shadowRoot.innerHTML = style;
						}
						this.#shadowRoot.appendChild(this.#element);
					}
				}
				
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
