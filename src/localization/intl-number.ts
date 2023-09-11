import {Props, Cube, ShadowRootMode} from "../types";
import {config} from "../config";
import {conditionalField} from "../utils";

interface IntlNumberProps {
	value: number;
	locale: string | undefined;
	type: "decimal" | "currency" | "percent" | "unit";
	// display
	groupingStyle: "always" | "auto" | false | "min2" | true | undefined;
	signDisplay: "auto" | "always" | "exceptZero" | "never" | undefined;
	notation: "scientific" | "standard" | "engineering" | "compact" | undefined;
	system: string | undefined;
	// currency
	currency: string | undefined;
	currencyDisplay: "symbol" | "narrowSymbol" | "code" | "name" | undefined;
	currencySign: "accounting" | "standard" | undefined;
	// unit | https://unicode.org/reports/tr35/tr35-general.html#Example_Units
	unit: string | undefined;
	unitStyle: "long" | "short" | "narrow" | undefined;
	// rounding
	rounding: "ceil" | "floor" | "expand" | "trunc" | "halfCeil" | "halfFloor" | "halfTrunc" | "halfEven" | undefined;
	roundingInc: 1 | 2 | 5 | 10 | 20 | 25 | 50 | 100 | 200 | 250 | 500 | 1000 | 2000 | 2500 | 5000 | undefined;
	minDigits: number | undefined;
	significantDigits: string | undefined; // how many total digits will be displayed
	decimalDigits: string | undefined; // how many decimal digits will be displayed
}

export default ({register, host, template}: Cube) => {
	const splitNumberString = (str: string): Array<number | undefined> => {
		const [a, b]: Array<number | undefined> = String(str)
			.split(',', 2)
			.map(n => {
				n = n.trim();
				
				if (n && !isNaN(Number(n))) {
					return Number(n);
				}
				
				return undefined;
			});
		
		if (b === undefined) {
			return [b, a];
		}
		
		return [a, b];
	}
	
	const IntlNumber = (props: Props<IntlNumberProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const numb = () => {
			const [minFracDig, maxFracDig] = splitNumberString(props.decimalDigits() || '')
			const [minDig, maxDig] = splitNumberString(props.significantDigits() || '');
			
			const options: Intl.NumberFormatOptions = {
				style: props.type(),
				...(props.type() === "currency" ? {
					...conditionalField('currency', props.currency()),
					...conditionalField('currencyDisplay', props.currencyDisplay()),
					...conditionalField('currencySign', props.currencySign()),
				} : {}),
				...(props.type() === "unit" ? {
					...conditionalField('unit', props.unit()),
					...conditionalField('unitDisplay', props.unitStyle()),
				} : {}),
				...conditionalField('signDisplay', props.signDisplay()),
				...conditionalField('useGrouping', props.groupingStyle()),
				...conditionalField('roundingMode', props.rounding()),
				...conditionalField('roundingIncrement', props.roundingInc()),
				...conditionalField('numberingSystem', props.system()),
				...conditionalField('notation', props.notation()),
				...conditionalField('minimumIntegerDigits', props.minDigits()),
				...conditionalField('minimumFractionDigits', minFracDig),
				...conditionalField('maximumFractionDigits', maxFracDig),
				...conditionalField('minimumSignificantDigits', minDig),
				...conditionalField('maximumSignificantDigits', maxDig)
			};
			
			const n = new Intl.NumberFormat(props.locale() || locale.language, options)
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
		groupingStyle: "auto",
		rounding: undefined,
		roundingInc: undefined,
		locale: undefined,
		minDigits: undefined,
		significantDigits: undefined,
		decimalDigits: undefined,
	}, {mode: ShadowRootMode.NONE})
}
