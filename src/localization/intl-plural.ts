import {Props, Cube, ShadowRootMode, ObjectLiteral} from "../types";
import {config} from "../config";

interface IntlPluralProps {
	value: number | undefined;
	other: string;
	zero: string;
	one: string;
	two: string;
	few: string;
	many: string;
	type: 'cardinal' | 'ordinal' | undefined;
	locale: string | undefined;
}

export default ({register, host, template, html, useContext}: Cube) => {
	const IntlPlural = (props: Props<IntlPluralProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const msgsctx = useContext<ObjectLiteral>("intl-msg", true);
		const content = comp.textContent;
		
		const plural = () => {
			const value = Number(props.value() ?? content);
			
			if (isNaN(value)) {
				return ''
			}
			
			const pr = new Intl.PluralRules(props.locale() || locale.language, {type: props.type()});
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
		locale: undefined,
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
