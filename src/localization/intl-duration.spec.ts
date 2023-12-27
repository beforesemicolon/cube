import {Cube} from "../types";
import * as cube from '../cube';
import initDuration, {IntlDurationProps} from './intl-duration';
import initLocale from './intl-locale';
import {render} from "../testing";
import {TC} from "../utils";
import {html, state} from "@beforesemicolon/web-component";

const CUBE = {
	...cube,
	TC,
	state
} as unknown as Cube

initLocale(CUBE)
const d = initDuration(CUBE)

describe('intl-duration', () => {
	const msgs = {
		title: 'Greetings {name}',
		description: 'Welcome to the test app',
	};
	
	beforeEach(() => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve(msgs)
			} as Response)
		});
	})
	
	it('should render nothing if no value', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-duration></intl-duration>
			</intl-locale>`);
		
		expect(cont.find('intl-duration').map(d => d.content)).toEqual([""])
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		expect(d(msgs)).toEqual("")
	});
	
	it('should render all fields', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-duration>1694326144082</intl-duration>
				<intl-duration value="1694326144082"></intl-duration>
			</intl-locale>`);
		
		expect(cont.find('intl-duration').map(d => d.content)).toEqual([
			"53 years, 8 months, 25 days, 6 hours, 9 minutes, and 4 seconds",
			"53 years, 8 months, 25 days, 6 hours, 9 minutes, and 4 seconds"
		])
		// no pluralization
		expect([
			{value: 1694326144082},
			{value: 1694326144082},
		].map(({value}) => d(msgs, value))).toEqual([
			"53 year, 8 month, 25 day, 6 hour, 9 minute, and 4 second",
			"53 year, 8 month, 25 day, 6 hour, 9 minute, and 4 second"
		])
	});
	
	it('should render individual fields', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-duration fields="year">1694326144082</intl-duration>
				<intl-duration fields="year">3.156e+10</intl-duration>
				<intl-duration fields="month">1694326144082</intl-duration>
				<intl-duration fields="month">2.628e+9</intl-duration>
				<intl-duration fields="day">1694326144082</intl-duration>
				<intl-duration fields="day">8.64e+7</intl-duration>
				<intl-duration fields="hour">1694326144082</intl-duration>
				<intl-duration fields="hour">3.6e+6</intl-duration>
				<intl-duration fields="minute">1694326144082</intl-duration>
				<intl-duration fields="minute">60000</intl-duration>
				<intl-duration fields="second">1694326144082</intl-duration>
				<intl-duration fields="second">1000</intl-duration>
			</intl-locale>`);
		
		expect(cont.find('intl-duration').map(d => d.content)).toEqual([
			"53 years",
			"1 year",
			"653 months",
			"1 month",
			"19610 days",
			"1 day",
			"470646 hours",
			"1 hour",
			"28238769 minutes",
			"1 minute",
			"1694326144 seconds",
			"1 second"
		])
		expect([
			{fields: "year", value: 1694326144082},
			{fields: "year", value: 3.156e+10},
			{fields: "month", value: 1694326144082},
			{fields: "month", value: 2.628e+9},
			{fields: "day", value: 1694326144082},
			{fields: "day", value: 8.64e+7},
			{fields: "hour", value: 1694326144082},
			{fields: "hour", value: 3.6e+6},
			{fields: "minute", value: 1694326144082},
			{fields: "minute", value: 60000},
			{fields: "second", value: 1694326144082},
			{fields: "second", value: 1000},
		].map(({value, fields}) => d(msgs, value, fields as IntlDurationProps['fields'])))
			.toEqual([
			"53 year",
			"1 year",
			"653 month",
			"1 month",
			"19610 day",
			"1 day",
			"470646 hour",
			"1 hour",
			"28238769 minute",
			"1 minute",
			"1694326144 second",
			"1 second"
		])
	});
	
	it('should return empty if the field provided has no value', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-duration fields="year">2.628e+9</intl-duration>
				<intl-duration fields="month">8.64e+7</intl-duration>
				<intl-duration fields="day">3.6e+6</intl-duration>
				<intl-duration fields="hour">60000</intl-duration>
				<intl-duration fields="minute">1000</intl-duration>
			</intl-locale>`);
		
		expect(cont.find('intl-duration').map(d => d.content)).toEqual([
			"",
			"",
			"",
			"",
			""
		])
		expect([
			{fields:"year", value:2.628e+9},
			{fields:"month", value:8.64e+7},
			{fields:"day", value:3.6e+6},
			{fields:"hour", value:60000},
			{fields:"minute", value:1000},
		].map(({value, fields}) => d(msgs, value, fields as IntlDurationProps['fields']))).toEqual([
			"",
			"",
			"",
			"",
			""
		])
	});
	
	it('should handle style', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-duration fields="hour" style="long">3.6e+6</intl-duration>
				<intl-duration fields="hour" style="short">3.6e+6</intl-duration>
				<intl-duration fields="hour" style="narrow">3.6e+6</intl-duration>
			</intl-locale>`);
		
		expect(cont.find('intl-duration').map(d => d.content)).toEqual([
			"1 hour",
			"1 hr",
			"1h"
		])
		expect([
			{fields: "hour", style: "long", value: 3.6e+6},
			{fields: "hour", style: "short", value: 3.6e+6},
			{fields: "hour", style: "narrow", value: 3.6e+6},
		].map(({value, fields, style}) => d(msgs, value, fields as IntlDurationProps['fields'], style as IntlDurationProps['style'])))
			.toEqual([
				"1 hour",
				"1 hour",
				"1hour"
			])
	});
})
