import {Cube, ObjectLiteral, Props} from "../types";
import {config} from "../config";

interface IntlMsgProps {
	id: string;
	values: Record<string, any>;
}

export default ({register, html, template, element, useContext, host}: Cube) => {
	
	const IntlMsg = (props: Props<IntlMsgProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		
		const msgs = useContext<ObjectLiteral>("intl-msg");
		
		const msg = () => {
			if (msgs.value() === null) {
				return '';
			}
			
			// @ts-ignore
			const dir = locale.textInfo.direction;
			const map = msgs.value() ?? {};
			const txtParts: Array<string> = [];
			const txtValues: Array<Element> = [];
			let text = map[props.id()];
			
			if (text === undefined) {
				console.error(`[intl-msg] id of "${props.id()}" was not found. Rendering the id itself as backup.`);
				return props.id();
			}
			
			const values  = props.values();
			
			const pattern = /\{\s*([a-z0-9]+)\s*\}/g;
			let txt = String(text)
			let match = null;
			
			while((match = pattern.exec(String(txt))) !== null) {
				const [_, key] = match;
				const before = txt.substring(0, match.index);
				
				before && txtParts.push(before)
				txtValues.push(element("slot", {
					attributes: {
						name: key
					},
					textContent: values[key]
				}))
				txt = txt.substring(pattern.lastIndex);
			}
			
			txtParts.push(txt);
			
			const markup = html(txtParts as unknown as TemplateStringsArray, txtValues);
			
			comp.setAttribute('dir', dir)
			return markup;
		}
		
		template`${msg}`;
	}
	
	register<IntlMsgProps>(IntlMsg, {
		id: "",
		values: {}
	})
}
