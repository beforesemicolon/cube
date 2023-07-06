import {Executable} from ".//type";
import {jsonParse, isObjectLiteral} from "../../utils";
import {HTMLRenderTemplate} from "../HTMLRenderTemplate";
import {handleTextExecutable} from "./handle-text-executable";
import {handleAttrDirectiveExecutable} from "./handle-attr-directive-executable";
import {extractExecutableValueFromRawValue} from "./extract-executable-value-from-raw-value";

export const handleExecutable = (executable: Executable, values: unknown[]) => {
	
	if (executable.subExecutables.length) {
		executable.subExecutables.forEach(executable => {
			handleExecutable(executable, values);
		})
	}
	
	for (let val of executable.values) {
		const parts = extractExecutableValueFromRawValue(val.rawValue || "", values);
		let value: any = "";
		
		switch (val.type) {
			case "attr-dir":
				value = jsonParse(parts.map(p => typeof p === "function" ? p() : p).join(""));
				handleAttrDirectiveExecutable(val, value);
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
			case "attr-value":
				value = jsonParse(parts.map(p => typeof p === "function" ? p() : p).join(""));
				
				if (value === val.value) {
					break;
				}
				
				(executable.node as Element).setAttribute(val.name, value);
				val.value = value;
				break;
			case "text":
				value = parts.flatMap(p => typeof p === "function" ? p() : p);
				
				if (value !== val.value) {
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
				}
				
				break;
		}
	}
}
