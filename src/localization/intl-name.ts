import {Props, Cube, ShadowRootMode} from "../types";
import {config} from "../config";

interface IntlNameProps {
	value: string;
	type: "language" | "region" | "script" | "dateTimeField" | "currency" | "calendar";
	style: 'long' | 'short' | 'narrow' | undefined;
	locale: string | undefined;
}

export default ({register, host, template}: Cube) => {
	const IntlName = (props: Props<IntlNameProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const name = () => {
			const value = props.value() || content || '';
			
			return value ? new Intl.DisplayNames(props.locale() || locale.language, {
				style: props.style(),
				type: props.type(),
			}).of(value) : ''
		}
		
		template`${name}`;
	}
	
	register<IntlNameProps>(IntlName, {
		value: "",
		type: "language",
		style: 'long',
		locale: undefined
	}, {mode: ShadowRootMode.NONE})
}
