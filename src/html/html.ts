import {jsonParse} from "../utils";
import {before} from "node:test";
import {isObjectLiteral} from "../utils/is-object-literal";

export interface ExecutableValue {
	type: "directive" | "attr" | "text" | "event",
	name: string;
	rawValue: string;
	value: unknown;
	renderedNode: Node | Node[];
	prop?: string;
}

export interface Executable {
	node: Node;
	values: ExecutableValue[];
	subExecutables: Executable[];
}

const extractExecutableValueFromRawValue = (rawValue: string, values: unknown[]) => {
	rawValue = rawValue.trim();
	let match: RegExpExecArray | null = null;
	const parts = [];

	while ((match = /{{val([0-9]+)}}/.exec(rawValue.trim())) !== null) {
		const [full] = match;
		const pre = rawValue.slice(0, match.index);

		if (pre.length) {
			parts.push(pre);
		}

		const numb = full.match(/\d+/g);

		if (numb) {
			const val = values[Number(numb[0])];
			parts.push(val)
		}

		rawValue = rawValue.slice(match.index + full.length)
	}

	return parts.length ? parts : [rawValue];
}

const changeCurrentIntoNewItems = (currentItems: Node[], newItems: Node[], endAnchor: Node) => {
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

			if(/^on[a-z]+/.test(attr.name)) {
				element.removeAttribute(attr.name);
				values.push({
					...details,
					prop: attr.name.slice(2),
					type: "event"
				})
			} else if (/(attr|bind)(\.([a-z0-9-.]+))?|ref/.test(attr.name)) {
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
			case "event":
				let node = Array.isArray(val.renderedNode)
					? (val.renderedNode as Node[])[0]
					: val.renderedNode as Node;
				const eventHandler = parts[0] as EventListenerOrEventListenerObject;
				const eventName = val.prop as string;
				const option = parts.length > 1
					? parts[2]
					: jsonParse(val.rawValue.split(',')[1]);

				if (typeof eventHandler !== "function") {
				    throw new Error(`handler for event "${val.name}" is not a function. Found ${eventHandler}.`)
				}

				if (val.value !== eventHandler) {
					const validOption = typeof option === "boolean" || isObjectLiteral(option);
					const eventOption = validOption ? option : undefined;

				    if (typeof val.value === "function") {
					    node.removeEventListener(eventName, eventHandler, eventOption)
				    }

					node.addEventListener(eventName, eventHandler, eventOption)
				}
				break;
			case "attr":
				value = jsonParse(parts.map(p => typeof p === "function" ? p() : p).join(""));

				if (value === val.value) {
					break;
				}

				(executable.node as Element).setAttribute(val.name, value);
				val.value = value;
				break;
			case "text":
				value = parts.flatMap(p => typeof p === "function" ? p() : p);

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