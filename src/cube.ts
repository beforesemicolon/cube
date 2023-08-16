import {HtmlTemplate} from "@beforesemicolon/html";
import {
	booleanAttributes,
	getStyleString,
	jsonParse,
	JSONToCSS,
	turnCamelToKebabCasing,
	turnKebabToCamelCasing
} from "./utils";
import {ComponentOptions, CurrentComponent, FnComponent, Props, ShadowRootMode, Style, Stylesheet} from "./types";

export function register<P extends Record<string, any>>(
	comp: FnComponent<P>,
	props: P = {} as P,
	styleOrOptions: Style<P> | ComponentOptions = {},
	opt: ComponentOptions = {}
) {
	const isStyle = typeof styleOrOptions === "function";
	const stylesheet = isStyle ? styleOrOptions : undefined;
	const {mode = ShadowRootMode.OPEN, delegatesFocus = false} = isStyle ? opt : styleOrOptions;
	
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
	
	return tagName;
}

let currentComponent: CurrentComponent | null = null;

export const onMount = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.mount = cb;
	} else {
		throw new Error('Must NOT use "onMount" lifecycle outside of a component')
	}
}

export const onUpdate = (cb: () => void) => {
	if (currentComponent) {
		currentComponent.update = cb;
	} else {
		throw new Error('Must NOT use "onUpdate" lifecycle outside of a component')
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
			if (newVal !== val) {
				val = newVal;
				comp?.template?.update();
			}
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

export const host = () => {
	if (currentComponent) {
		return currentComponent.self;
	}
	
	throw new Error('Must NOT use "host" outside of a component')
}

function createComponentClass<P extends Record<string, any>>(tagName: string, {
	delegatesFocus = false,
	mode = ShadowRootMode.OPEN,
	props,
	comp,
	stylesheet
}: {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
	props: P,
	comp: FnComponent<P>;
	stylesheet?: Style<P>;
}) {
	const CLS = customElements.get(tagName);
	
	if (!CLS) {
		class WebComponent extends HTMLElement {
			// @ts-ignore
			static observedAttributes: Array<string> = Object.keys(props).map(turnCamelToKebabCasing);
			static readonly tagName = tagName;
			#renderedBefore = false;
			#shadowRoot: ShadowRoot | HTMLElement;
			#handlers: CurrentComponent = {
				destroy: () => {
				},
				mount: () => {},
				update: () => {},
				adoption: () => {
				},
				dispatchEvent: (e: CustomEvent) => {
					this.dispatchEvent(e)
				},
				template: null,
				self: this,
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
							: getStyleString(style, tagName.toLowerCase());
					}
				}
				
				return style;
			}
			
			updateStyle() {
				const style = this.getStyle();
				
				if (this.#styleElement) {
					const div = document.createElement("div");
					div.innerHTML = style;
					const styleEl = document.head.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
					
					if (styleEl) {
						this.#styleElement.textContent = styleEl.textContent;
					}
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
							
							if (newValue !== oldValue) {
								this.#props[key as keyof P] = newValue;
								
								// only perform DOM updates while mounted
								if (this.isConnected) {
									this.#handlers.update(key, newValue, oldValue);
									this.#handlers.template?.update();
									// only update style if it is a callback expecting arguments
									// otherwise it is an indication that the style does not use the props values
									if (typeof stylesheet === "function" && stylesheet.length > 0) {
										this.updateStyle();
									}
								}
							}
						}
					})
				});
				
				if (mode === ShadowRootMode.NONE) {
					this.#shadowRoot = this;
				} else {
					this.#shadowRoot = this.attachShadow({mode, delegatesFocus});
				}
			}
			
			async connectedCallback() {
				if (!this.#renderedBefore) {
					this.#renderedBefore = true;
					currentComponent = this.#handlers;
					comp(this.#readonlyProps);
					currentComponent = null;
					
					const style = this.getStyle();
					
					if (style) {
						if (mode === ShadowRootMode.NONE) {
							const styleEl = document.head.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
							
							if (!styleEl) {
								document.head.insertAdjacentHTML("beforeend", style);
							}
							
							this.#styleElement = styleEl;
						} else {
							this.#shadowRoot.innerHTML = style;
							this.#styleElement = this.#shadowRoot.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
						}
					}
					
					this.#handlers.template?.render(this.#shadowRoot);
				} else {
					this.#handlers.template?.update();
				}
				
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
