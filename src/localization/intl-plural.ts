import {Props, Cube, ShadowRootMode} from "../types";
import {config} from "../config";

interface IntlPluralProps {
	value: number | undefined;
	other: string;
	zero: string;
	one: string;
	two: string;
	few: string;
	many: string;
	type: 'cardinal' | 'ordinal' | undefined
}

export default ({register, host, template, html}: Cube) => {
	const IntlPlural = (props: Props<IntlPluralProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const content = comp.textContent;
		
		const plural = () => {
			const value = props.value() ?? Number(content);
			const pr = new Intl.PluralRules(locale.language, {type: props.type()});
			
			const val = props[pr.select(value)]();
			
			if (props.type() === 'ordinal') {
				return html`${value}<slot name="${val}">${val}</slot>`;
			}
			
			return val || value;
		}
		
		template`${plural}`
	}
	
	register<IntlPluralProps>(IntlPlural, {
		value: undefined,
		other: '',
		zero: '',
		one: '',
		two: '',
		few: '',
		many: '',
		type: 'cardinal',
	})
}
