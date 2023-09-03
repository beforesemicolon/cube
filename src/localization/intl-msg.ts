import {Cube, Props, ShadowRootMode} from "../types";

interface IntlMsgProps {
	id: string;
	tag: string;
	values: Record<string, any>;
}

export default ({register, html, template, element, useContext, host}: Cube) => {
	
	const IntlMsg = (props: Props<IntlMsgProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		
		const msgs = useContext<Record<string, unknown>>("intl-msg");
		
		const msg = () => {
			if (msgs.value() === null) {
				return '';
			}
			
			const dir = locale.textInfo.direction;
			const map = msgs.value() ?? {};
			const txtParts: Array<string> = [];
			const txtValues: Array<Element> = [];
			let text = map[props.id()];
			
			if (text === undefined) {
				console.error(`Intl Message with id  of "${props.id()}" not found. Using the id as backup.`);
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
			
			if (props.tag()) {
				const el = element(props.tag());
				
				markup.render(el);
				
				el.setAttribute('dir', dir)
				return el;
			}
			
			comp.setAttribute('dir', dir)
			return markup;
		}
		
		template`${msg}`;
	}
	
	register<IntlMsgProps>(IntlMsg, {
		id: "",
		tag: "",
		values: {}
	})
}
