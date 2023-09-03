import {Props, Cube, ShadowRootMode} from "../types";
import {isValidDate} from './utils/is-valid-date';
import {ONE_HOUR, ONE_MINUTE, ONE_SECOND, ONE_DAY} from "./utils/time-in-miliseconds";

interface IntlRelTimeProps {
	live: boolean;
	value: number | Date;
	showDecimals: false;
	seconds: number;
	milliseconds: number;
	style: 'long' | 'short' | 'narrow' | undefined;
	numeric: boolean;
	unit: "year"
		| "years"
		| "quarter"
		| "quarters"
		| "month"
		| "months"
		| "week"
		| "weeks"
		| "day"
		| "days"
		| "hour"
		| "hours"
		| "minute"
		| "minutes"
		| "second"
		| "seconds";
}

const getUpdateIntervalByUnit = (unit: IntlRelTimeProps['unit']) => {
	switch (unit) {
		case "hours":
		case "hour":
			return ONE_HOUR;
		case "minutes":
		case "minute":
			return ONE_MINUTE;
		case "seconds":
		case "second":
			return ONE_SECOND;
		default:
			return null;
	}
}

const getUnitAndValue = (milliseconds: number, precision = 0): {
	val: number,
	unit: IntlRelTimeProps['unit'];
	interval: number | null
} => {
	const inThePast = milliseconds < 0 ? -1 : 1;
	milliseconds = Math.abs(milliseconds);
	const days = Number((milliseconds / ONE_DAY).toFixed(precision));
	
	if (days < 1) {
		if (milliseconds < ONE_MINUTE) {
			return {
				val: Number((milliseconds / ONE_SECOND).toFixed(precision)) * inThePast,
				unit: 'seconds',
				interval: getUpdateIntervalByUnit('seconds')
			};
		}
		
		const hours = days / (ONE_MINUTE * 60)
		
		if (hours < 1) {
			return {
				val: Number((milliseconds / ONE_MINUTE).toFixed(precision)) * inThePast,
				unit: 'minutes',
				interval: getUpdateIntervalByUnit('minutes')
			};
		}
		
		return {
			val: Number((hours).toFixed(precision)) * inThePast,
			unit: 'hours',
			interval: getUpdateIntervalByUnit('hours')
		};
	}
	
	
	if (days < 7) {
		return {
			val: days * inThePast,
			unit: days === 1 ? 'day' : 'days',
			interval: null
		};
	}
	
	if (days < 30) {
		return {
			val: Number((days / 7).toFixed(precision)) * inThePast,
			unit: days === 7 ? 'week' : 'weeks',
			interval: null
		};
	}
	
	if (days < 365) {
		return {
			val: Number((days / 30).toFixed(precision)) * inThePast, // average a month to 30 days
			unit: days === 30 ? 'month' : 'months',
			interval: null
		};
	}
	
	return {
		val: Number((days / 365).toFixed(precision)) * inThePast,
		unit: days === 365 ? 'year' : 'years',
		interval: null
	};
}

export default ({register, host, template, useValue, onMount}: Cube) => {
	
	const IntlRelTime = (props: Props<IntlRelTimeProps>) => {
		const comp = host();
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		const [time, setTime] = useValue('');
		let interval: ReturnType<typeof setTimeout>;
		const content = comp.textContent;
		
		comp.innerHTML = '';
		
		const getTime = (): { value: string | null; interval: number | null } => {
			const relative = new Intl.RelativeTimeFormat(locale.language, {
				style: props.style(),
				numeric: props.numeric() ? 'always' : 'auto'
			});
			let value = props.value() || content;
			const precision = props.showDecimals() ? 1 : 0;
			
			if (props.milliseconds()) {
				value = new Date(props.milliseconds());
			} else if (props.seconds()) {
				value = new Date(props.seconds() * ONE_SECOND);
			}
			
			if (value instanceof Date) {
				if (!isValidDate(value)) {
					return {value: `[Invalid Date: ${value}]`, interval: null};
				}
				
				const rel = getUnitAndValue(value.getTime() - Date.now(), precision)
				
				return {
					value: relative.format(rel.val, rel.unit),
					interval: rel.interval
				};
			}
			
			if (props.unit() && value) {
				return {
					value: relative.format(Number(Number(value).toFixed(precision)), props.unit()),
					interval: getUpdateIntervalByUnit(props.unit())
				};
			}
			
			return {value: null, interval: null};
		}
		
		const updateTime = () => {
			const time = getTime();
			time.value && setTime(time.value);
			
			if (time.interval) {
				interval = setTimeout(updateTime, time.interval)
			}
		}
		
		onMount(() => {
			if (props.live()) {
				interval = setTimeout(updateTime, 0)
				
				return () => {
					clearInterval(interval);
				}
			} else {
				const time = getTime();
				time.value && setTime(time.value)
			}
		})
		
		template`${time}`;
	}
	
	register<IntlRelTimeProps>(IntlRelTime, {
		showDecimals: false,
		live: false,
		value: 0,
		seconds: 0,
		milliseconds: 0,
		numeric: false,
		style: 'long',
		unit: 'days'
	}, {mode: ShadowRootMode.NONE})
}
