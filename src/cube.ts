import {
	jsonParse,
	JSONToCSS,
	getStyleString,
	booleanAttributes,
	turnKebabToCamelCasing,
	turnCamelToKebabCasing
} from "./utils";
import {element, ElementInterface} from "./element";
import {HTMLRenderTemplate} from "./html";

export interface StylesheetObject {
	[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}

export type Stylesheet = StylesheetObject | string;
export type Renderer<P> = (props: P) => void;
type HTMLRenderer = (elementToAttachNodesTo?: ShadowRoot | HTMLElement) => void;
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

export function register<P extends Record<string, any>, S extends Record<string, any>>(
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

interface CurrentComponent<S> {
	destroy: () => void;
	mount: () => void;
	adoption: () => void;
	styleControl: {
		update: (styleProps: Partial<S>) => void;
		detach: () => void;
		attach: () => void;
		reset: () => void;
	},
	dispatchEvent: (e: CustomEvent) => void;
	renderer: HTMLRenderer;
}


let currentComponent: CurrentComponent<{}>;

export const onMount = (cb: () => void) => {
	currentComponent.mount = cb;
}

export const onDestroy = (cb: () => void) => {
	currentComponent.destroy = cb;
}

export const onAdoption = (cb: () => void) => {
	currentComponent.adoption = cb;
}

export const Style = (styleProps?: {}) => {
	const control = currentComponent.styleControl;

	styleProps && control.update(styleProps);

	return control
}

export const EventDispatch = <Data>() => {
	const dispatchEvent = currentComponent.dispatchEvent;

	return <T>(eventName: string, detail?: T) => {
		dispatchEvent(new CustomEvent(eventName, {
			detail
		}))
	}
}


export const template = (parts: TemplateStringsArray, ...values: unknown[]): HTMLRenderTemplate => {
	const temp = new HTMLRenderTemplate(parts, values);

	currentComponent.renderer = temp.render;

	return temp;
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
			#shadowRoot: ShadowRoot;
			#props = structuredClone(props);
			#handlers: CurrentComponent<S> = {
				destroy: () => {
				},
				mount: () => {
				},
				adoption: () => {
				},
				styleControl: {
					update: this.updateStyle.bind(this),
					detach: this.detachStyle.bind(this),
					attach: this.attachStyle.bind(this),
					reset: this.resetStyle.bind(this),
				},
				dispatchEvent: (e: CustomEvent) => {
					this.dispatchEvent(e)
				},
				renderer: () => ([]),
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
								this.#handlers.renderer(this.#shadowRoot);
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
				this.#handlers.renderer(this.#shadowRoot);

				const style = this.getStyle({} as S);

				if (style) {
					this.#shadowRoot.innerHTML = style;
					this.#styleElement = this.#shadowRoot.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
				}

				this.#handlers.mount();
			}

			async disconnectedCallback() {
				this.#handlers.destroy();
			}

			async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
				const propName = turnKebabToCamelCasing(name);

				if (!newValue && typeof props[propName] === 'boolean' && name in booleanAttributes) {
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
