import {Props, Cube, ShadowRootMode} from "../types";
import {millisecondsToTimeParts} from "./utils/milliseconds-to-time-parts";

const allFields = new Set(['second', 'minute', 'hour', 'day', 'month', 'year'])

interface IntlDurationProps {
	value: Date | number | undefined;
	style: "narrow" | "short" | "long";
	fields: '*' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
}

export default ({register, host, template, element, useContext, useValue}: Cube) => {
	const IntlDuration = (props: Props<IntlDurationProps>) => {
		const comp = host();
		const msgsctx = useContext<Record<string, unknown>>("intl-msg", true);
		const locale = new Intl.Locale(document.documentElement.lang || 'en');
		const content = comp.textContent;
		const name = new Intl.DisplayNames(locale.language, {
			style: "long",
			type: "dateTimeField",
		});
		const list = new Intl.ListFormat(locale.language, {
			style: "long",
			type: "conjunction",
		})
		
		comp.innerHTML = '';
		
		const getText = (value: number, key: string) => {
			const msg = msgsctx.value();
			const cubeIntl = msg ? (msg['cube-intl'] as Record<string, any>) : null;
			
			if (cubeIntl && cubeIntl[key]) {
				if (props.style() === "narrow") {
					return cubeIntl[key].narrow;
				}
				
				if (props.style() === "short") {
					return cubeIntl[key].short;
				}
				
				return value === 1
					? cubeIntl[key].single
					: cubeIntl[key].plural
			}
			
			return name.of(key);
		}
		
		const duration = () => {
			const fields = props.fields().trim() === "*"
				? allFields
				: new Set((props.fields() || '').split(/\s+/g).map(s => s.trim()))
			let value = props.value() || content;
			
			if (value instanceof Date) {
				value = value.getTime();
			} else {
				value = Number(value);
			}
			
			const tp = millisecondsToTimeParts(value, fields);
			const gap = props.style() === "narrow" ? "" : " "
			
			return list.format([
				...((fields.has("year")) && tp.year ? [`${[tp.year]}${gap}${getText(tp.year, 'year')}`] : []),
				...((fields.has("month")) && tp.month ? [`${[tp.month]}${gap}${getText(tp.month, 'month')}`] : []),
				...((fields.has("day")) && tp.day ? [`${[tp.day]}${gap}${getText(tp.day, 'day')}`] : []),
				...((fields.has("hour")) && tp.hour ? [`${[tp.hour]}${gap}${getText(tp.hour, 'hour')}`] : []),
				...((fields.has("minute")) && tp.minute ? [`${[tp.minute]}${gap}${getText(tp.minute, 'minute')}`] : []),
				...((fields.has("second")) && tp.second ? [`${[tp.second]}${gap}${getText(tp.second, 'second')}`] : []),
			]);
		}
		
		template`${duration}`;
	}
	
	register<IntlDurationProps>(IntlDuration, {
		value: undefined,
		style: "long",
		fields: "*"
	}, {mode: ShadowRootMode.NONE})
}
