import {Props, Cube, ShadowRootMode} from "../types";
import {conditionalField} from "./utils/conditional-field";

export interface IntlDatetimeProps {
	hour12: boolean | undefined;
	weekday: 'long' | 'short' | 'narrow' | undefined;
	era: 'long' | 'short' | 'narrow' | undefined;
	dayPeriod: 'long' | 'short' | 'narrow' | undefined;
	year: 'numeric' | '2-digit' | undefined;
	day: 'numeric' | '2-digit' | undefined;
	dateStyle: 'full' | 'long' | 'medium' | 'short' | undefined;
	timeStyle: 'full' | 'long' | 'medium' | 'short' | undefined;
	hour: 'numeric' | '2-digit' | undefined;
	minute: 'numeric' | '2-digit' | undefined;
	second: 'numeric' | '2-digit' | undefined;
	month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined;
	hourCycle: 'h11' | 'h12' | 'h23' | 'h24' | undefined;
	timezone: 'UTC' | string | undefined;
	timezoneName: 'long' | 'short' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric' | undefined;
	value: string | number;
	locale: string | undefined;
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getCalendars#supported_calendar_types
	calendar: 'buddhist'
		| 'chinese'
		| 'coptic'
		| 'dangi'
		| 'ethioaa'
		| 'ethiopic'
		| 'gregory'
		| 'hebrew'
		| 'indian'
		| 'islamic'
		| 'islamic-umalqura'
		| 'islamic-tbla'
		| 'islamic-civil' // instead of islamicc
		| 'islamic-rgsa'
		| 'iso8601'
		| 'japanese'
		| 'persian'
		| 'roc'
		| undefined;
}

export default ({register, host, template, config, TC}: Cube) => {
	const intlDatetimeDefaultProps: IntlDatetimeProps = {
		hour12: false,
		hourCycle: 'h23',
		weekday: 'short',
		locale: undefined,
		era: undefined,
		dayPeriod: 'long',
		year: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		month: 'numeric',
		timeStyle: undefined,
		dateStyle: undefined,
		calendar: undefined,
		timezone: undefined,
		timezoneName: 'short',
		value: "",
	}
	
	const intlDatetime = (lang: string, value: string | number = '', opt?: Partial<Omit<IntlDatetimeProps, 'value' | 'locale'>>) => {
		if(!TC.oneOf(value, TC.string, TC.number)) {
			console.error('intl-datetime: invalid value', value);
			return ''
		}
		
		opt = {...intlDatetimeDefaultProps, ...opt}
		
		const dateTimeOptions = {
			...conditionalField('weekday', opt.weekday),
			...conditionalField('era', opt.era),
			...conditionalField('year', opt.year),
			...conditionalField('month', opt.month),
			...conditionalField('day', opt.day),
			...conditionalField('dayPeriod', opt.dayPeriod),
			...conditionalField('hour', opt.hour),
			...conditionalField('minute', opt.minute),
			...conditionalField('second', opt.second),
		}
		
		const dt = new Intl.DateTimeFormat(lang, {
			hour12: opt.hour12,
			...conditionalField('calendar', opt.calendar),
			...conditionalField('hourCycle', opt.hourCycle),
			...conditionalField('timeStyle', opt.timeStyle),
			...conditionalField('dateStyle', opt.dateStyle),
			...conditionalField('timeZone', opt.timezone),
			...conditionalField('timezoneName', opt.timezoneName),
			// if dateStyle or timeStyle is provided we cannot set individual time/date options
			...(opt.dateStyle || opt.timeStyle ? {} : dateTimeOptions),
		})
		
		try {
			const date = TC.string(value) || TC.numeric(value)
				? TC.numeric(value) ? new Date(Number(value)) : new Date(value)
				: value;
			
			if (!TC.validDate(date)) {
				throw new Error('Invalid Date')
			}
			
			return dt.format(date);
		} catch (e) {
			return `[Invalid Date: ${value}]`
		}
	}
	
	const IntlDatetime = (props: Props<IntlDatetimeProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const dateString = () => {
			const value = props.value() || content || Date.now();
			
			return intlDatetime(
				props.locale() || locale.language,
				value,
				Object.keys(props).reduce((acc, key) => {
					// @ts-ignore
					acc[key] = props[key]();
					return acc;
				}, {} as IntlDatetimeProps),
			)
		};
		
		template`${dateString}`;
	}
	
	register<IntlDatetimeProps>(IntlDatetime, intlDatetimeDefaultProps, {mode: ShadowRootMode.NONE})
	
	return intlDatetime;
}
