import {HtmlTemplate} from "@beforesemicolon/html";
import {
	booleanAttributes,
	getStyleString,
	jsonParse,
	JSONToCSS,
	turnCamelToKebabCasing,
	turnKebabToCamelCasing
} from "./utils";
import {ComponentOptions, FnComponent, Props, ShadowRootMode, Style, Stylesheet, CurrentComponent} from "./types";
import initContext from "./context";

let currentComponent: CurrentComponent | null = null;
const defaultOptions: ComponentOptions = {
	mode: ShadowRootMode.OPEN,
	delegatesFocus: false
}
const CTX = initContext(() => currentComponent)

export const {useContext, createContext, onContextUpdate} = CTX;

export function globalConfig(opt: ComponentOptions = defaultOptions) {
	defaultOptions.mode = opt.mode && [ShadowRootMode.OPEN, ShadowRootMode.CLOSED, ShadowRootMode.NONE].includes(opt.mode)
		? opt.mode
		: ShadowRootMode.OPEN;
	defaultOptions.delegatesFocus = typeof opt.delegatesFocus === "boolean" ? opt.delegatesFocus : false;
}

export function register<P extends Record<string, any>>(
	comp: FnComponent<P>,
	props: P = {} as P,
	styleOrOptions: Style<P> | ComponentOptions = defaultOptions,
	opt: ComponentOptions = defaultOptions
) {
	const isStyle = typeof styleOrOptions === "function";
	const stylesheet = isStyle ? styleOrOptions : undefined;
	const {mode = defaultOptions.mode, delegatesFocus = defaultOptions.delegatesFocus} = isStyle ? opt : styleOrOptions;
	
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
	
	return {
		tagName, props, mode,
		delegatesFocus,
	};
}

export const onMount = (cb: () => void) => {
	if (currentComponent) {
		if (currentComponent.mount === null) {
			currentComponent.mount = cb;
		}
	} else {
		throw new Error('Must NOT use "onMount" lifecycle outside of a component')
	}
}

export const onUpdate = (cb: (propName: string, newValue: unknown, oldValue: unknown) => void) => {
	if (currentComponent) {
		if (currentComponent.update === null) {
			currentComponent.update = cb;
		}
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
		if (currentComponent.adoption === null) {
			currentComponent.adoption = cb;
		}
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
				destroy: null,
				mount: null,
				update: null,
				adoption: null,
				dispatchEvent: (e: CustomEvent) => {
					this.dispatchEvent(e)
				},
				contextMap: new Map(),
				contextUpdate: () => {
					this.#handlers.template?.update();
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
									this.#handlers.update?.(key, newValue, oldValue);
									// only update style if it is a callback expecting arguments
									// otherwise it is an indication that the style does not use the props values
									if (typeof stylesheet === "function" && stylesheet.length > 0) {
										this.updateStyle();
									}
									
									this.#handlers.template?.update();
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
					// verify that the component was mounted in context and
					// subscribe it to all context it needs
					this.#handlers.contextMap.forEach((val, name) => {
						try {
							const ctx = CTX.getContextHost(name, this) ?? null;
							val.inContext = true;
							val.ctx = ctx;
							val.ctx?.subs.add(this.#handlers.contextUpdate)
						} catch (e) {
							console.error(`Component "${tagName}" is no longer in context of "${name}"`);
							// set inContext to false in case there is something trying to
							// read or update the context. only components in context can do that
							val.inContext = false;
						}
					})
					this.#handlers.template?.update();
				}
				
				const destroy = this.#handlers.mount?.();
				
				if (!this.#handlers.destroy && typeof destroy === "function") {
					this.#handlers.destroy = destroy;
				}
			}
			
			async disconnectedCallback() {
				// unsubscribe from any existing context
				this.#handlers.contextMap.forEach((val, name) => {
					val.ctx?.subs.delete(this.#handlers.contextUpdate)
				})
				this.#handlers.destroy?.();
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
				this.#handlers.adoption?.();
			}
		}
		
		return customElements.define(tagName, WebComponent);
	}
}
