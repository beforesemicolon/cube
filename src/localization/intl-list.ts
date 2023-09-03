import {Props, Cube, ShadowRootMode} from "../types";

interface IntlListProps {
	items: Array<string> | undefined;
	type: 'and' | 'or' | 'none' | 'disjunction' | 'conjunction' | 'unit';
	style: 'short' | 'narrow' | 'long';
}

export default ({register, template}: Cube) => {
	
	const Type: Record<string, any> = {
		or: "disjunction",
		and: "conjunction",
		none: 'unit'
	}
	
	const IntlList = (props: Props<IntlListProps>) => {
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		
		const list = () => {
			return new Intl.ListFormat(locale.language, {
				style: props.style(),
				type: (Type[props.type()] ?? props.type()) || 'and',
			}).format(props.items());
		}
		
		template`${list}`;
	}
	
	register<IntlListProps>(IntlList, {
		items: undefined,
		type: 'and',
		style: 'long'
	}, {mode: ShadowRootMode.NONE})
}
