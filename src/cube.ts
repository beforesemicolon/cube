import {HtmlTemplate} from "@beforesemicolon/html";
import {
	booleanAttributes,
	getStyleString,
	jsonParse,
	JSONToCSS,
	turnCamelToKebabCasing,
	turnKebabToCamelCasing
} from "./utils";
import {ComponentOptions, CurrentComponent, Renderer, RendererProps, Stylesheet} from "./types";

export function register<P extends Record<string, any>, S extends Record<string, any>>(
	renderer: Renderer<P>,
	props: P = {} as P,
	stylesheet?: (data: S) => Stylesheet,
	{mode = "open", delegatesFocus = false}: ComponentOptions = {}
) {
	const tagName = turnCamelToKebabCasing(renderer.name || "");

	if (!tagName) {
		throw new Error("Component render function must have a name")
	}

	createComponentClass<P, S>(tagName, {
		mode,
		delegatesFocus,
		renderer,
		props,
		stylesheet
	});
}

let currentComponent: CurrentComponent<{}> | null = null;

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

export const style = (styleProps?: {}) => {
	if (currentComponent) {
		const control = currentComponent.styleControl;

		styleProps && control.update(styleProps);

		return control
	}

	throw new Error('Must NOT use "Style" outside of a component')
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

export const useValue = () => {
	if (currentComponent) {
		const comp = currentComponent;

		return <V>(val: V) => {
			return [
				() => val,
				(newVal: V) => {
					val = newVal;
					comp?.renderer?.update();
				}
			]
		}
	}

	throw new Error('Must NOT use "useValue" outside of a component')
}

export const template = (parts: TemplateStringsArray, ...values: unknown[]) => {
	if (currentComponent) {
		currentComponent.renderer = new HtmlTemplate(parts, values);

		return currentComponent.renderer;
	}

	throw new Error('Must NOT use "template" outside of a component')
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
				beforeUpdate: () => {
				},
				afterUpdate: () => {
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
				renderer: null,
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
								this.#handlers.beforeUpdate();
								this.#props[key as keyof P] = newValue;
								this.#handlers.renderer?.update();
								this.#handlers.afterUpdate();
							}
						}
					})
				});

				this.#shadowRoot = this.attachShadow({mode, delegatesFocus});
			}

			async connectedCallback() {
				this.#shadowRoot.innerHTML = "";

				currentComponent = this.#handlers;
				renderer(Object.keys(this.#props).reduce((acc, key: keyof P) => {
					acc[key] = () => this.#props[key];
					return acc;
				}, {} as RendererProps<P>));
				currentComponent = null;

				const style = this.getStyle({} as S);

				if (style) {
					this.#shadowRoot.innerHTML = style;
					this.#styleElement = this.#shadowRoot.querySelector(`[class="${tagName.toLowerCase()}"]`) as HTMLStyleElement;
				}

				this.#handlers.renderer?.render(this.#shadowRoot);

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
