import {HtmlTemplate} from "@beforesemicolon/html";
import {
	booleanAttributes,
	getStyleString,
	jsonParse,
	JSONToCSS,
	turnCamelToKebabCasing,
	turnKebabToCamelCasing
} from "./utils";
import {ComponentOptions, CurrentComponent, FnComponent, Props, Stylesheet} from "./types";

export function register<P extends Record<string, any>>(
	comp: FnComponent<P>,
	props: P = {} as P,
	stylesheet?: (data: Props<P>) => Stylesheet,
	{mode = "open", delegatesFocus = false}: ComponentOptions = {}
) {
	const tagName = turnCamelToKebabCasing(comp.name || "");
	
	if (!tagName) {
		throw new Error("Component render function must have a name")
	}
	
	createComponentClass<P>(tagName, {
		mode,
		delegatesFocus,
		comp,
		props,
		stylesheet
	});
}

let currentComponent: CurrentComponent | null = null;

export const onMount = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.mount = cb;
	} else {
		throw new Error('Must NOT use "onMount" lifecycle outside of a component')
	}
}

export const onBeforeUpdate = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.beforeUpdate = cb;
	} else {
		throw new Error('Must NOT use "onBeforeUpdate" lifecycle outside of a component')
	}
}

export const onAfterUpdate = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.afterUpdate = cb;
	} else {
		throw new Error('Must NOT use "onAfterUpdate" lifecycle outside of a component')
	}
}

export const onDestroy = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.destroy = cb;
	} else {
		throw new Error('Must NOT use "onDestroy" lifecycle outside of a component')
	}
}

export const onAdoption = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.adoption = cb;
	} else {
		throw new Error('Must NOT use "onAdoption" lifecycle outside of a component')
	}
}

export const eventDispatch = <Data>() => {
	if (currentComponent) {
		const dispatchEvent = currentComponent.dispatchEvent;
		
		return <T>(eventName: string, detail?: T) => {
			dispatchEvent(new CustomEvent(eventName, {
				detail
			}))
		}
	}
	
	throw new Error('Must NOT use "EventDispatch" outside of a component')
}

export const useValue = <V>(val: V): [() => V, (newVal: V) => void] => {
	if (currentComponent) {
		const comp = currentComponent;
		
		return [() => val, (newVal: V) => {
			val = newVal;
			comp?.template?.update();
		}]
	}
	
	throw new Error('Must NOT use "useValue" outside of a component')
}

export const template = (parts: TemplateStringsArray, ...values: unknown[]) => {
	if (currentComponent) {
		currentComponent.template = new HtmlTemplate(parts, values);
		
		return currentComponent.template;
	}
	
	throw new Error('Must NOT use "template" outside of a component')
}

function createComponentClass<P extends Record<string, any>>(tagName: string, {
	delegatesFocus = false,
	mode = "open",
	props,
	comp,
	stylesheet
}: {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
	props: P,
	comp: FnComponent<P>;
	stylesheet?: (data: Props<P>) => Stylesheet;
}) {
	const CLS = customElements.get(tagName);
	
	if (!CLS) {
		class WebComponent extends HTMLElement {
			// @ts-ignore
			static observedAttributes: Array<string> = Object.keys(props).map(turnCamelToKebabCasing);
			static readonly tagName = tagName;
			#shadowRoot: ShadowRoot;
			#handlers: CurrentComponent = {
				destroy: () => {
				},
				mount: () => {
				},
				adoption: () => {
				},
				beforeUpdate: () => {
				},
				afterUpdate: () => {
				},
				dispatchEvent: (e: CustomEvent) => {
					this.dispatchEvent(e)
				},
				template: null,
			}
			#styleElement?: HTMLStyleElement;
			#props: P = structuredClone(props);
			#readonlyProps: Props<P> = Object.keys(this.#props).reduce((acc, key: keyof P) => {
				acc[key] = () => this.#props[key];
				return acc;
			}, {} as Props<P>)
			
			getStyle() {
				let style: Stylesheet = "";
				
				if (typeof stylesheet === "function") {
					style = stylesheet(this.#readonlyProps);
					
					if (style) {
						style = typeof style === 'object'
							? `<style class="${tagName.toLowerCase()}">${JSONToCSS(style, tagName, true)}</style>`
							: getStyleString(style, tagName.toLowerCase(), true);
					}
				}
				
				return style;
			}
			
			updateStyle() {
				const style = this.getStyle();
				
				if (this.#styleElement) {
					const div = document.createElement("div");
					div.innerHTML = style
					this.#styleElement.innerHTML = div.children[0].innerHTML;
				}
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
							const mounted = this.isConnected;
							
							if (newValue !== oldValue) {
								this.#props[key as keyof P] = newValue;
								
								mounted && this.#handlers.beforeUpdate();
								this.#handlers.template?.update();
								// only update style if it is a callback expecting arguments
								// otherwise it is an indication that the style does not use the props values
								if (typeof stylesheet === "function" && stylesheet.length > 0) {
									this.updateStyle();
								}
								mounted && this.#handlers.afterUpdate();
							}
						}
					})
				});
				
				this.#shadowRoot = this.attachShadow({mode, delegatesFocus});
			}
			
			async connectedCallback() {
				this.#shadowRoot.innerHTML = "";
				
				currentComponent = this.#handlers;
				comp(this.#readonlyProps);
				currentComponent = null;
				
				const style = this.getStyle();
				
				if (style) {
					this.#shadowRoot.innerHTML = style;
					this.#styleElement = this.#shadowRoot.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
				}
				
				this.#handlers.template?.render(this.#shadowRoot);
				this.#handlers.mount();
			}
			
			async disconnectedCallback() {
				this.#handlers.destroy();
			}
			
			async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
				const propName = turnKebabToCamelCasing(name);
				
				if (!newValue && typeof this.#props[propName] === 'boolean' && name in booleanAttributes) {
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
