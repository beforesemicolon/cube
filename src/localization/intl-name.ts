import {Props, Cube, ShadowRootMode} from "../types";

interface IntlNameProps {
	value: string;
	type: "language" | "region" | "script" | "dateTimeField" | "currency" | "calendar";
	style: 'long' | 'short' | 'narrow' | undefined;
	lang: string;
}

export default ({register, host, template, element, useContext, useValue}: Cube) => {
	const IntlName = (props: Props<IntlNameProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const name = () => {
			const value = props.value() || content || '';
			
			return value ? new Intl.DisplayNames(props.lang() || locale.language, {
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
		lang: ''
	}, {mode: ShadowRootMode.NONE})
}
