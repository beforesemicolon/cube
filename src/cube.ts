import {turnKebabToCamelCasing} from "./utils/turn-kebab-to-camel-casing";
import {turnCamelToKebabCasing} from "./utils/turn-camel-to-kebab-casing";
import {jsonParse} from "./utils/json-parse";
import {JSONToCSS} from "./utils/json-to-css";
import {getStyleString} from "./utils/get-style-string";
import {element, ElementInterface} from "./element";
import booleanAttributes from "./utils/boolean-attributes.json";
import {log} from "util";

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

interface ExecutableValue {
	type: "directive" | "attr" | "text",
	name: string;
	rawValue: string;
	value: unknown;
	renderedNode: Node | Node[];
	prop?: string;
}

interface Executable {
	node: Node;
	values: ExecutableValue[];
	subExecutables: Executable[];
}

const checkNodeSlotAndDirectives = (node: Node, cb: (executable: Executable) => void) => {
	const values: Executable['values'] = [];
	
	if (node.nodeType === 1) {
		const element = node as Element;
		for (const attr of element.attributes) {
			const details = {
				name: attr.name,
				rawValue: attr.value,
				value: attr.value,
				renderedNode: node,
			};
			
			if (/(attr|bind)(\.([a-z0-9-.]+))?|ref/.test(attr.name)) {
				const isAttrOrBind = attr.name.match(/(attr|bind)\.([a-z0-9-.]+)/);
				const prop = isAttrOrBind ? isAttrOrBind[2] : "";
				element.removeAttribute(attr.name)
				values.push({
					...details,
					type: "directive",
					prop
				})
			} else if (/{{val[0-9]+}}/.test(attr.value)) {
				values.push({
					...details,
					type: "attr"
				})
			}
		}
	} else if (node.nodeType === 3) {
		if (/{{val[0-9]+}}/.test(node.nodeValue || "")) {
			values.push({
				type: "text",
				name: "nodeValue",
				rawValue: node.nodeValue ?? "",
				value: node.nodeValue,
				renderedNode: node,
			});
		}
	}
	
	if (values.length) {
		cb({
			node,
			values,
			subExecutables: []
		})
	}
}

const extractExecutableValueFromRawValue = (rawValue: string, values: unknown[]) => {
	rawValue = rawValue.trim();
	let match: RegExpExecArray | null = null;
	const parts = [];
	
	while ((match = /{{val([0-9]+)}}/.exec(rawValue.trim())) !== null) {
		const [val] = match;
		const pre = rawValue.slice(0, match.index);

		if (pre.length) {
			parts.push(pre);
		}
		
		const numb = val.match(/\d+/g)
		
		if (numb) {
			const val = values[Number(numb[0])];
			parts.push(typeof val === "function" ? val() : val)
		}
		
		rawValue = rawValue.slice(match.index + val.length)
	}
	
	return parts.length ? parts : [rawValue];
}

function changeCurrentIntoNewItems(currentItems: Node[], newItems: Node[], endAnchor: Node) {
	if (currentItems.length && newItems.length) {
		let i = 0;
		let len = Math.max(newItems.length, currentItems.length);
		const newItemsSet = new Set(newItems);
		
		while (i < len) {
			const n = newItems[i];
			const c = currentItems[i];
			
			if (!c && !n) {
			    break;
			}
			
			if (n === undefined) {
				delete currentItems[i];
				c.parentNode?.removeChild(c)
				i += 1;
				continue;
			}
			
			if (c === undefined) {
				endAnchor.parentNode?.insertBefore(n, endAnchor);
				currentItems.splice(i, 0, n);
				i += 1;
				continue;
			}
			
			if (newItemsSet.has(c)) {
				if (n !== c) {
					c.parentNode?.insertBefore(n, c);
					c.parentNode?.removeChild(c)
					currentItems.splice(i, 1, n)
				}
				i += 1;
			} else {
				c.parentNode?.removeChild(c);
				currentItems.splice(i, 1)
			}
		}
		
		endAnchor.parentNode?.removeChild(endAnchor);
	}
}

const handleTextExecutable = (executableValue: ExecutableValue, nodes: Node[]) => {
	const renderedIsAList = Array.isArray(executableValue.renderedNode);
	
	if (nodes.length) {
		if (renderedIsAList) {
			const renderedNodes = executableValue.renderedNode as Node[];
			const lastNode = renderedNodes.at(-1);
			let endAnchor: Node;
			
			if (lastNode?.nextSibling) {
				endAnchor = lastNode.nextSibling
			} else {
				endAnchor = document.createComment("");
				lastNode?.parentNode?.appendChild(endAnchor)
			}
			
			changeCurrentIntoNewItems(renderedNodes, nodes, endAnchor)
		} else {
			const r = executableValue.renderedNode as Node;
			
			nodes.forEach((n) => {
				r.parentNode?.insertBefore(n, r);
			});
			
			r.parentNode?.removeChild(r);
		}
		
		executableValue.renderedNode = nodes;
	} else {
		let n = renderedIsAList
			? (executableValue.renderedNode as Node[])[0]
			: executableValue.renderedNode as Node;
		
		const emptyNode = document.createTextNode("");
		n.parentNode?.replaceChild(emptyNode, n);

		if (renderedIsAList) {
			(executableValue.renderedNode as Node[]).forEach(n => {
				n.parentNode?.removeChild(n);
			})
		}

		executableValue.renderedNode = emptyNode;
	}
}

const handleExecutable = (executable: Executable, values: unknown[]) => {
	
	try {
		if (executable.subExecutables.length) {
			executable.subExecutables.forEach(executable => {
				handleExecutable(executable, values);
			})
		}
		
		for (let val of executable.values) {
			const parts = extractExecutableValueFromRawValue(val.rawValue || "", values);
			let value: any = "";
			
			switch (val.type) {
				case "directive":
					switch (val.name) {
						case "attr":
						case "bind":
						case "ref":
					}
					break;
				case "attr":
					value = jsonParse(parts.join(""));
					
					if (value === val.value) {
						break;
					}
					
					(executable.node as Element).setAttribute(val.name, value);
					val.value = value;
					break;
				case "text":
					value = parts.flat(10);
					
					if (value === val.value) {
						break;
					}
					
					val.value = value;
					
					const div = document.createElement("div");
					const nodes: Node[] = [];
					
					if (Array.isArray(value)) {
						value.forEach(v => {
							if (v instanceof HTMLRenderTemplate) {
								const renderedBefore = v.renderTarget;
								v.render(div);
								nodes.push(...(renderedBefore ? v.nodes.filter(n => n.isConnected) : Array.from(div.childNodes)));
								div.innerHTML = "";
							} else if (v instanceof Node) {
								nodes.push(v)
							} else {
								div.insertAdjacentHTML("beforeend", v);
								nodes.push(...Array.from(div.childNodes))
								div.innerHTML = ""
							}
						})
					} else {
						div.innerHTML = value ?? "";
						nodes.push(...Array.from(div.childNodes));
					}
					
					handleTextExecutable(val, nodes);
					break;
			}
		}
	} catch (e) {
		console.log('-- handleExecutable err', e);
	}
}

export class HTMLRenderTemplate {
	htmlTemplate: string;
	nodes: Node[];
	renderTarget: HTMLElement | ShadowRoot | null = null;
	#executable: Executable;
	
	constructor(parts: TemplateStringsArray, public values: unknown[]) {
		const frag = document.createDocumentFragment();
		const el = document.createElement("div");
		this.htmlTemplate = parts.map((s, i) => {
			return i == parts.length - 1 ? s : s + `{{val${i}}}`;
		}).join("").trim();
		el.innerHTML = this.htmlTemplate;
		el.childNodes.forEach(n => {
			frag.appendChild(n)
		});
		
		this.#executable = (function traverse(n: HTMLElement | DocumentFragment, ancestorExecutable: Executable) {
			Array.from(n.childNodes, c => {
				let cn: Executable | null = null;
				
				checkNodeSlotAndDirectives(c, executable => {
					cn = executable;
					ancestorExecutable.subExecutables.push(executable);
				});
				
				if (c.nodeType === 1) {
					traverse(c as HTMLElement, cn ?? ancestorExecutable)
				}
			});
			
			return ancestorExecutable;
		})(frag, {node: frag, values: [], subExecutables: []});
		
		this.nodes = Array.from(frag.childNodes);
	}
	
	render = (elementToAttachNodesTo?: ShadowRoot | HTMLElement, force = false) => {
		if (elementToAttachNodesTo && (force || !this.renderTarget) && (
			elementToAttachNodesTo instanceof ShadowRoot ||
			elementToAttachNodesTo instanceof HTMLElement
		)) {
			this.nodes.forEach(node => {
				if (node.parentNode !== elementToAttachNodesTo) {
					elementToAttachNodesTo.appendChild(node)
				}
			})
			this.renderTarget = elementToAttachNodesTo;
		}
		
		this.#executable.subExecutables.forEach(executable => {
			handleExecutable(executable, this.values);
		});
	}
}

export const html = (parts: TemplateStringsArray, ...values: unknown[]): HTMLRenderTemplate => {
	return new HTMLRenderTemplate(parts, values)
}

export const template = (parts: TemplateStringsArray, ...values: unknown[]) => {
	const temp = new HTMLRenderTemplate(parts, values);
	
	currentComponent.renderer = temp.render;
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
