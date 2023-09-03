import {Props, Cube, ShadowRootMode} from "../types";

interface IntlNumberProps {
	value: number;
	type: "decimal" | "currency" | "percent" | "unit";
	currency: string | undefined,
	currencyDisplay: "symbol" | "narrowSymbol" | "code" | "name" | undefined,
	currencySign: "accounting" | "standard" | undefined,
	signDisplay: "auto" | "always" | "exceptZero" | "never" |undefined,
	notation: "scientific" | "standard" | "engineering" | "compact" | undefined,
	system: string | undefined,
	// https://unicode.org/reports/tr35/tr35-general.html#Example_Units
	unit: string | undefined;
	unitStyle: "long" | "short" | "narrow" | undefined;
	groupingStyle: "always" | "auto" | false | "min2" | true | undefined;
	rounding: "ceil" | "floor" | "expand" | "trunc" | "halfCeil" | "halfFloor" | "halfTrunc" | "halfEven" | undefined,
}

export default ({register, host, template, element, useContext, useValue}: Cube) => {
	const IntlNumber = (props: Props<IntlNumberProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const numb = () => {
			
			const n = new Intl.NumberFormat(locale.language, {
				style: props.type(),
				...(props.type() === "currency" ? {
					currency: props.currency(),
					currencyDisplay: props.currencyDisplay(),
					currencySign: props.currencySign(),
				} : {}),
				...(props.type() === "unit" ? {
					unit: props.unit(),
					unitDisplay: props.unitStyle(),
				} : {}),
				signDisplay: props.signDisplay(),
				// @ts-ignore
				useGrouping: props.groupingStyle(),
				roundingMode: props.rounding(),
				numberingSystem: props.system(),
				notation: props.notation(),
			})
			const value = Number(props.value() || content);
			
			return n.format(value)
		}
		
		template`${numb}`
	}
	
	register<IntlNumberProps>(IntlNumber, {
		value: 0,
		type: "decimal",
		currency: undefined,
		currencyDisplay: 'narrowSymbol',
		currencySign: undefined,
		signDisplay: undefined,
		notation: undefined,
		system: undefined,
		unit: undefined,
		unitStyle: 'narrow',
		groupingStyle: undefined,
		rounding: undefined
	}, {mode: ShadowRootMode.NONE})
}
