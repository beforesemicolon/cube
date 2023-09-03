import {Props, Cube, ShadowRootMode} from "../types";
import {isValidDate} from './utils/is-valid-date';

interface IntlDateProps {
	hour12: boolean;
	weekday: 'long' | 'short' | 'narrow' | undefined;
	era: 'long' | 'short' | 'narrow' | undefined;
	dayPeriod: 'long' | 'short' | 'narrow' | undefined;
	year: 'numeric' | '2-digit' | undefined;
	day: 'numeric' | '2-digit' | undefined;
	dateStyle: 'full' | 'long' | 'medium' | 'short' | undefined;
	timeStyle: 'full' | 'long' | 'medium' | 'short' | undefined;
	hour: 'numeric' | '2-digit' | undefined;
	minute: 'numeric' | '2-digit' | undefined;
	seconds: 'numeric' | '2-digit' | undefined;
	month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined;
	hourCycle: 'h11' | 'h12' | 'h23' | 'h24' | undefined;
	timezone: 'UTC' | string | undefined;
	timezoneName: 'long' | 'short' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric' | undefined;
	value: Date | string | number;
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getCalendars#supported_calendar_types
	cal: 'buddhist'
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

export default ({register, host, template}: Cube) => {
	const IntlDate = (props: Props<IntlDateProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const dateString = () => {
			const dateTimeOptions = {
				// if dateStyle or timeStyle is provided we cannot set these
				weekday: props.weekday() || undefined,
				era: props.era() || undefined,
				year: props.year() || undefined,
				month: props.month() || undefined,
				day: props.day() || undefined,
				dayPeriod: props.dayPeriod() || undefined,
				hour: props.hour() || undefined,
				minute: props.minute() || undefined,
				second: props.seconds() || undefined,
			}
			
			const fomatter = new Intl.DateTimeFormat(locale.language, {
				hour12: props.hour12(),
				calendar: props.cal() || locale.calendars[0],
				...(props.hourCycle() ? {hourCycle: props.hourCycle()} : {}),
				...(props.timeStyle() ? {timeStyle: props.timeStyle()} : {}),
				...(props.dateStyle() ? {dateStyle: props.dateStyle()} : {}),
				...(props.dateStyle() || props.timeStyle() ? {} : dateTimeOptions),
				...(props.timezone() ? {timeZone: props.timezone()} : {}),
				...(props.timezoneName() ? {timezoneName: props.timezoneName()} : {}),
			})
			const value = props.value() || content || Date.now();
			
			try {
				const date = typeof value == "string" || typeof value == "number"
					? new Date(value)
					: value as Date;
				
				if (!isValidDate(date)) {
					throw new Error('Invalid Date')
				}
				
				return fomatter.format(date);
			} catch (e) {
				return `[Invalid Date: ${value}]`
			}
		};
		
		template`${dateString}`;
	}
	
	register<IntlDateProps>(IntlDate, {
		hour12: false,
		hourCycle: 'h23',
		weekday: 'short',
		era: undefined,
		dayPeriod: 'long',
		year: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		seconds: '2-digit',
		month: '2-digit',
		timeStyle: undefined,
		dateStyle: undefined,
		cal: undefined,
		timezone: undefined,
		timezoneName: 'short',
		value: "",
	}, {mode: ShadowRootMode.NONE})
}
