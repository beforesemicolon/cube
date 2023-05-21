import {turnKebabToCamelCasing} from "./utils/turn-kebab-to-camel-casing";
import {turnCamelToKebabCasing} from "./utils/turn-camel-to-kebab-casing";
import {jsonParse} from "./utils/json-parse";
import {JSONToCSS} from "./utils/json-to-css";
import {getStyleString} from "./utils/get-style-string";

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
export type Renderer<P> = (props: P, self: CubeComponent<P>) => [Element, Stylesheet | null];

export function Cube<P extends Record<string, any>>(
	tagName: string,
	props: P,
	renderer: Renderer<P>
) {
	return () => {
		createComponentClass(tagName, {
			renderer,
			props
		});
	}
}


function createComponentClass<P extends Record<string, any>>(tagName: string, {
	delegatesFocus = false,
	mode = "open",
	props,
	renderer
}: {
	mode?: "open" | "closed";
	delegatesFocus?: boolean;
	props: P,
	renderer: Renderer<P>;
}) {
	const CLS = customElements.get(tagName);
	
	if (!CLS) {
		class WebComponent extends HTMLElement {
			// @ts-ignore
			static observedAttributes: Array<string> = Object.keys(props).map(turnCamelToKebabCasing);
			static readonly tagName = tagName;
			#shadowRoot: ShadowRoot;
			#element: Element | null = null;
			#props = JSON.parse(JSON.stringify(props)); // todo: use structured clone
			#destroyHandler = () => {};
			#mountHandler = () => {};
			#adoptionHandler = () => {};
			#updateHandler = (name: string, newValue: unknown, oldValue: unknown) => {};
			
			constructor() {
				super();
				
				Object.keys(this.#props).forEach((key) => {
					Object.defineProperty(this, key, {
						get() {
							return this.#props[key];
						},
						set(newValue: any) {
							const oldValue = this.#props[key];
							this.#props[key as keyof P] = newValue;
							this.#updateHandler(key, this.#props[key], oldValue);
						}
					})
				});
				
				Object.defineProperty(this, "onMount", {
					get() {
						return (cb: () => void) => {
							if (typeof cb === "function") {
								this.#mountHandler = cb;
							}
						}
					},
				})
				
				Object.defineProperty(this, "onDestroy", {
					get() {
						return (cb: () => void) => {
							if (typeof cb === "function") {
								this.#destroyHandler = cb;
							}
						}
					},
				})
				
				Object.defineProperty(this, "onAdoption", {
					get() {
						return (cb: () => void) => {
							if (typeof cb === "function") {
								this.#adoptionHandler = cb;
							}
						}
					},
				})
				
				Object.defineProperty(this, "onUpdate", {
					get() {
						return (cb: (propName: string) => void) => {
							if (typeof cb === "function") {
								this.#updateHandler = cb;
							}
						}
					},
				})
				
				this.#shadowRoot = this.attachShadow({mode, delegatesFocus});
			}
			
			async connectedCallback() {
				const noElement = this.#element === null;
				
				if (noElement || this.isConnected) {
					const [element, stylesheet = null] = renderer(this.#props, this as unknown as CubeComponent<P>);
					this.#element = element;
					
					if (noElement) {
						let style = "";
						
						if (stylesheet !== null) {
							style = typeof stylesheet === 'object'
								? `<style class="${tagName}">${JSONToCSS(stylesheet, tagName, true)}</style>`
								: getStyleString(stylesheet, tagName, true);
						}
						
						this.#shadowRoot.innerHTML = style;
						this.#shadowRoot.appendChild(this.#element);
					}
				}
				
				this.#mountHandler();
			}
			
			async disconnectedCallback() {
				this.#destroyHandler();
			}
			
			async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
				name = turnKebabToCamelCasing(name);
				// @ts-ignore
				this[name] = jsonParse(newValue);
			}
			
			async adoptedCallback() {
				this.#adoptionHandler();
			}
		}
		
		return customElements.define(tagName, WebComponent);
	}
	
	throw new Error(`Component for tag "${tagName}" is already registered`)
}
