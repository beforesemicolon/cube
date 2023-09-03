import {Cube, Props, ShadowRootMode} from "../types";

const defaultLocale = {
	'cube-intl': {
		year: {single: "year", plural: "years", narrow: "yr", short: "year"},
		month: {single: "month", plural: "months", narrow: "m", short: "month"},
		week: {single: "week", plural: "weeks", narrow: "week", short: "week"},
		day: {single: "day", plural: "days", narrow: "day", short: "day"},
		hour: {single: "hour", plural: "hours", narrow: "h", short: "hr"},
		minute: {single: "minute", plural: "minutes", narrow: "min", short: "min"},
		second: {single: "second", plural: "seconds", narrow: "s", short: "sec"},
		millisecond: {single: "millisecond", plural: "milliseconds", narrow: "ms", short: "mils"},
		nanosecond: {single: "nanosecond", plural: "nanoseconds", narrow: "ns", short: "nano"},
	}
}

interface IntlLocaleProps {
	src: string;
	srcDir: string;
}

export default ({register, template, onMount, createContext}: Cube) => {
	const IntlLocale = (props: Props<IntlLocaleProps>) => {
		const msgs = createContext("intl-msg", null);
		
		onMount(() => {
			if (props.src()) {
				fetch(props.src())
					.then(res => {
						if (res.status === 200) {
							return res.json()
						}
						
						throw new Error(`Loading "${props.src()}" locale messages failed with status code ${res.status}`);
					})
					.then(data => {
						msgs.update({
							...defaultLocale,
							...data
						});
					})
					.catch(console.error)
			} else if (props.srcDir()) {
				const lang = document.documentElement.lang || "en";
				const src = `${props.srcDir().replace(/\/$/, '')}/${lang}.json`
				
				fetch(src)
					.then(res => {
						if (res.status === 200) {
							return res.json()
						}
						
						throw new Error(`Loading "${src}" locale messages failed with status code ${res.status}`);
					})
					.then(data => {
						msgs.update({
							...defaultLocale,
							...data
						});
					})
					.catch(console.error)
			}
		})
		
		template`<slot></slot>`;
	}
	
	register<IntlLocaleProps>(IntlLocale, {
		src: "",
		srcDir: "./"
	}, {mode: ShadowRootMode.NONE})
}
