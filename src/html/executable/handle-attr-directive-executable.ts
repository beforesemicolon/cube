import {ExecutableValue} from "./type";
import {booleanAttributes, jsonParse, turnCamelToKebabCasing, turnKebabToCamelCasing} from "../../utils";

export const handleAttrDirectiveExecutable = (executableValue: ExecutableValue, value: string) => {
	if (value !== executableValue.value) {
		executableValue.value = value;
		let [attrName, property] = (executableValue.prop || "").split(".");
		const element = executableValue.renderedNode as HTMLElement;
		let shouldAdd = typeof value === "boolean" ? value : true;
		
		if (typeof value === "string") {
			const parts = value.split(",");
			const lastPart = jsonParse((parts.at(-1) as string).trim());
			
			if(parts.length && typeof lastPart === "boolean") {
				shouldAdd = lastPart;
				value = parts.length > 1 ? parts.slice(0, -1).join("") : value;
			}
		}
		
		switch (attrName) {
			case 'style':
				if (property) {
					element.style.setProperty(property, shouldAdd ? value : '');
				} else {
					value
						.match(/([a-z][a-z-]+)(?=:):([^;]+)/g)
						?.forEach((style: string) => {
							let [name, styleValue] = style.split(':').map(s => s.trim());
							
							if (shouldAdd) {
								element.style.setProperty(name, styleValue);
							} else {
								element.style.removeProperty(name);
							}
						})
				}
				
				if (!element.style.length) {
					element.removeAttribute("style")
				}
				
				break;
			case 'class':
				if (property) {
					if (shouldAdd) {
						element.classList.add(property);
					} else {
						element.classList.remove(property);
					}
				} else {
					const classes = value.split(/\s+/g);
					
					if (shouldAdd) {
						classes.forEach((cls: string) => element.classList.add(cls));
					} else {
						classes.forEach((cls: string) => element.classList.remove(cls));
					}
				}
				
				if (!element.classList.length) {
					element.removeAttribute("class")
				}
				break;
			case 'data':
				if (property) {
					if (shouldAdd) {
						element.dataset[turnKebabToCamelCasing(property)] = value;
					} else {
						element.removeAttribute(`data-${turnCamelToKebabCasing(property)}`)
					}
				}
				break;
			default:
				if (attrName) {
					const boolAttr = (booleanAttributes as Record<string, {possibleValues?: string[]}>)[attrName];
					
					if (shouldAdd) {
						if (boolAttr) {
							element.setAttribute(attrName, boolAttr.possibleValues && boolAttr.possibleValues.includes(value) ? value : "");
						} else {
							element.setAttribute(attrName, value);
						}
					} else {
						element.removeAttribute(attrName);
					}
				}
		}
	}
}
