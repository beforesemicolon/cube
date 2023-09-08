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

export default ({register, host, template, html, useContext}: Cube) => {
	const IntlPlural = (props: Props<IntlPluralProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const msgsctx = useContext<Record<string, unknown>>("intl-msg", true);
		const content = comp.textContent;
		
		const plural = () => {
			const value = props.value() ?? Number(content);
			const pr = new Intl.PluralRules(locale.language, {type: props.type()});
			const msg = msgsctx.value();
			const cubeIntl = msg ? (msg['cube-intl'] as Record<string, any>) : null;
			const sel = pr.select(value);
			const val = props[sel]() || cubeIntl?.plural[sel] || '';
			
			if (props.type() === 'ordinal') {
				return html`${value}<slot name="${sel}">${val}</slot>`;
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
