import {HtmlTemplate} from "@beforesemicolon/html";
import {
	booleanAttributes,
	getStyleString,
	jsonParse,
	JSONToCSS,
	turnCamelToKebabCasing,
	turnKebabToCamelCasing
} from "./utils";
import {ComponentOptions, FnComponent, Props, ShadowRootMode, Style, Stylesheet} from "./types";

const defaultOptions: ComponentOptions = {
	mode: ShadowRootMode.OPEN,
	delegatesFocus: false
}

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

interface ContextModel<T> {
	readonly: boolean;
	getData: () => T;
	setData: (data: T) => void;
	subs: Set<(name: string, newValue: unknown, oldValue: unknown) => void>
}

type Context<T> = Record<string, ContextModel<T>>;

interface CurrentComponent {
	destroy: (() => void) | null;
	mount: (() => void | (() => void)) | null;
	adoption: (() => void) | null;
	update: ((propName: string, newValue: unknown, oldValue: unknown) => void) | null;
	contextUpdate: (propName: string, newValue: unknown, oldValue: unknown) => void;
	dispatchEvent: (e: CustomEvent) => void;
	contextMap: Map<string, {reactive: boolean; inContext: boolean; ctx: ContextModel<unknown> | null}>;
	template: HtmlTemplate | null;
	self: HTMLElement;
}

let currentComponent: CurrentComponent | null = null;

const CONTEXT: WeakMap<HTMLElement, Context<unknown>> = new WeakMap();

const getContextHost = (name: string, ancestor: HTMLElement) => {
	const tagName = ancestor.tagName;
	
	while (ancestor) {
		if (!ancestor) {
			break;
		}
		
		if (ancestor instanceof ShadowRoot) {
			ancestor = ancestor.host as HTMLElement;
		}
		
		const host = CONTEXT.get(ancestor);
		
		if (host && host[name]) {
			return host[name];
		}
		
		// move this to the end so the component can find its own context first
		ancestor = ancestor.parentNode as HTMLElement;
	}
	
	if (!ancestor) {
		throw new Error(`Component "${tagName}" is not in context of "${name}"`)
	}
}

export const useContext = <T>(name: string, reactive = true) => {
	if (currentComponent) {
		const comp = currentComponent;
		const ctx = getContextHost(name, currentComponent.self) ?? null;
		
		comp.contextMap.set(name, {
			reactive,
			ctx,
			inContext: true
		})
		
		if (reactive) {
			ctx?.subs.add(comp?.contextUpdate)
		}
		
		return {
			update: (newValue: T) => {
				const host = comp.contextMap.get(name);
				
				if (host?.inContext && host?.ctx) {
					host.ctx.setData(newValue);
				}
			},
			value: (): T | null => {
				const host = comp.contextMap.get(name);
				
				if (host && host.inContext) {
					return host?.ctx?.getData() as T;
				}
				
				return null;
			},
		}
	} else {
		throw new Error('Must NOT use "useContext" outside of a component')
	}
}

export const createContext = <T>(name: string, data: T, {readonly = false, reactive = true} = {}) => {
	if (currentComponent) {
		if (!CONTEXT.has(currentComponent.self)) {
			const subs: ContextModel<T>['subs'] = new Set();
			
			if (reactive) {
				subs.add(currentComponent.contextUpdate)
			}
			
			CONTEXT.set(currentComponent.self, {
				[name]: {
					readonly,
					getData() {
						return data
					},
					setData(newValue: T) {
						const oldValue = data;
						data = newValue;
						subs.forEach((sub) => sub(name, newValue, oldValue))
					},
					subs
				}
			} as Context<unknown>);
		} else {
			throw new Error(`A context named "${name}" already exists for this component`)
		}
		
		return useContext<T>(name, reactive);
	} else {
		throw new Error('Must NOT use "createContext" outside of a component')
	}
}

export const onContextUpdate = (cb: (propName: string, newValue: unknown, oldValue: unknown) => void) => {
	if (currentComponent) {
		const comp = currentComponent;
		comp.contextMap.forEach((val, name) => {
			// remove any sub added by useContext
			val.ctx?.subs.delete(comp.contextUpdate);
			// set a new contextUpdate so the onDestroy can clea it up
			comp.contextUpdate = (...args) => {
				val.reactive && currentComponent?.template?.update();
				cb(...args)
			};
			// then override with this new contextUpdate
			val.ctx?.subs.add(comp.contextUpdate)
		})
	} else {
		throw new Error('Must NOT use "onMount" lifecycle outside of a component')
	}
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
							const ctx = getContextHost(name, this) ?? null;
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
