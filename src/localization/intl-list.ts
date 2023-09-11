import {Props, Cube, ShadowRootMode} from "../types";
import {config} from "../config";

interface IntlListProps {
	items: Array<string> | undefined;
	type: 'and' | 'or' | 'none' | 'disjunction' | 'conjunction' | 'unit';
	style: 'short' | 'narrow' | 'long' | undefined;
	locale: string | undefined;
}

export default ({register, template}: Cube) => {
	
	const Type: Record<string, any> = {
		or: "disjunction",
		and: "conjunction",
		none: 'unit'
	}
	
	const IntlList = (props: Props<IntlListProps>) => {
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		
		const list = () => {
			// @ts-ignore
			return new Intl.ListFormat(props.locale() || locale.language, {
				style: props.style(),
				type: (Type[props.type()] ?? props.type()) || 'and',
			}).format(props.items() || []);
		}
		
		template`${list}`;
	}
	
	register<IntlListProps>(IntlList, {
		items: undefined,
		type: 'and',
		style: 'long',
		locale: undefined
	}, {mode: ShadowRootMode.NONE})
}
