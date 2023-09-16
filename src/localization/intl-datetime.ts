import {Props, Cube, ShadowRootMode} from "../types";
import {config} from "../config";
import {conditionalField} from "../utils";

interface IntlDatetimeProps {
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

export default ({register, host, template, TC}: Cube) => {
	const IntlDatetime = (props: Props<IntlDatetimeProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || config.lang);
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const dateString = () => {
			const dateTimeOptions = {
				...conditionalField('weekday', props.weekday()),
				...conditionalField('era', props.era()),
				...conditionalField('year', props.year()),
				...conditionalField('month', props.month()),
				...conditionalField('day', props.day()),
				...conditionalField('dayPeriod', props.dayPeriod()),
				...conditionalField('hour', props.hour()),
				...conditionalField('minute', props.minute()),
				...conditionalField('second', props.second()),
			}
			
			const fomatter = new Intl.DateTimeFormat(props.locale() || locale.language, {
				hour12: props.hour12(),
				...conditionalField('calendar', props.calendar()),
				...conditionalField('hourCycle', props.hourCycle()),
				...conditionalField('timeStyle', props.timeStyle()),
				...conditionalField('dateStyle', props.dateStyle()),
				...conditionalField('timeZone', props.timezone()),
				...conditionalField('timezoneName', props.timezoneName()),
				// if dateStyle or timeStyle is provided we cannot set individual time/date options
				...(props.dateStyle() || props.timeStyle() ? {} : dateTimeOptions),
			})
			const value = props.value() || content || Date.now();
			
			try {
				const date = TC.string(value) || TC.numeric(value)
					? TC.numeric(value) ? new Date(Number(value)) : new Date(value)
					: value;
				
				if (!TC.validDate(date)) {
					throw new Error('Invalid Date')
				}
				
				return fomatter.format(date);
			} catch (e) {
				return `[Invalid Date: ${value}]`
			}
		};
		
		template`${dateString}`;
	}
	
	register<IntlDatetimeProps>(IntlDatetime, {
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
	}, {mode: ShadowRootMode.NONE})
}
