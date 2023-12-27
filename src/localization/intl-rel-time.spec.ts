import {Cube} from "../types";
import * as cube from '../cube';
import initRelTime from './intl-rel-time';
import {render, wait, waitFor} from "../testing";
import {html, state} from "@beforesemicolon/web-component";
import {
	ONE_HOUR_MS,
	ONE_MINUTE_MS,
	ONE_MONTH_MS,
	ONE_SECOND_MS,
	ONE_WEEK_MS,
	ONE_YEAR_MS,
	ONE_DAY_MS
} from "./utils/time-in-miliseconds";
import {TC} from '../utils';

const CUBE = {
	...cube,
	state,
	TC
} as unknown as Cube

const rel = initRelTime(CUBE)

describe('intl-rel-time', () => {
	
	it('should be empty for non numeric value', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-rel-time></intl-rel-time>
			</intl-locale>`);
		
		expect(cont.find('intl-rel-time').map(d => d.content)).toEqual([
			"",
		])
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		expect(rel('en', ''))
	});
	
	it('should handle specific unit', async () => {
		const cont = await render(html`
			<intl-rel-time unit="years">20</intl-rel-time>
			<intl-rel-time unit="quarter" value="20"></intl-rel-time>
			<intl-rel-time unit="weeks">20</intl-rel-time>
			<intl-rel-time unit="day">20</intl-rel-time>
			<intl-rel-time unit="hour" value="20"></intl-rel-time>
			<intl-rel-time unit="minute">20</intl-rel-time>
			<intl-rel-time unit="seconds">20</intl-rel-time>
		`);
		
		const expected = [
			"in 20 years",
			"in 20 quarters",
			"in 20 weeks",
			"in 20 days",
			"in 20 hours",
			"in 20 minutes",
			"in 20 seconds"
		]
		
		expect(cont.find('intl-rel-time').map(d => d.content)).toEqual(expected)
		expect([
			{value: 20, unit: 'years'},
			{value: 20, unit: 'quarter'},
			{value: 20, unit: 'weeks'},
			{value: 20, unit: 'day'},
			{value: 20, unit: 'hour'},
			{value: 20, unit: 'minute'},
			{value: 20, unit: 'seconds'},
		].map(({value, unit}) => rel('en', value, {unit} as any))).toEqual(expected)
	});
	
	it('should handle auto unit', async () => {
		const cont = await render(html`
			<intl-rel-time>${Date.now() - ONE_SECOND_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - ONE_MINUTE_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - (ONE_MINUTE_MS * 30)}</intl-rel-time>
			<intl-rel-time>${Date.now() - ONE_HOUR_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - ONE_DAY_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - ONE_WEEK_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - (ONE_WEEK_MS * 2)}</intl-rel-time>
			<intl-rel-time>${Date.now() - ONE_MONTH_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - (ONE_MONTH_MS * 6)}</intl-rel-time>
			<intl-rel-time>${Date.now() - ONE_YEAR_MS}</intl-rel-time>
			<intl-rel-time>${Date.now() - (ONE_YEAR_MS * 3)}</intl-rel-time>
		`);
		
		const expected = [
			"1 second ago",
			"1 minute ago",
			"30 minutes ago",
			"1 hour ago",
			"yesterday",
			"last week",
			"2 weeks ago",
			"last month",
			"6 months ago",
			"last year",
			"3 years ago"
		]
		
		expect(cont.find('intl-rel-time').map(d => d.content)).toEqual(expected)
		expect([
			{value: Date.now() - ONE_SECOND_MS},
			{value: Date.now() - ONE_MINUTE_MS},
			{value: Date.now() - (ONE_MINUTE_MS * 30)},
			{value: Date.now() - ONE_HOUR_MS},
			{value: Date.now() - ONE_DAY_MS},
			{value: Date.now() - ONE_WEEK_MS},
			{value: Date.now() - (ONE_WEEK_MS * 2)},
			{value: Date.now() - ONE_MONTH_MS},
			{value: Date.now() - (ONE_MONTH_MS * 6)},
			{value: Date.now() - ONE_YEAR_MS},
			{value: Date.now() - (ONE_YEAR_MS * 3)},
		].map(({value}) => rel('en', value))).toEqual(expected)
	});
	
	it('should handle style', async () => {
		const cont = await render(html`
			<intl-rel-time unit="year">20</intl-rel-time>
			<intl-rel-time style="short" unit="year">20</intl-rel-time>
			<intl-rel-time style="narrow" unit="year">20</intl-rel-time>
		`);
		
		const expected = [
			"in 20 years",
			"in 20 yr.",
			"in 20y"
		]
		
		expect(cont.find('intl-rel-time').map(d => d.content)).toEqual(expected)
		expect([
			{value: 20, unit: 'year'},
			{value: 20, unit: 'year', style: 'short'},
			{value: 20, unit: 'year', style: 'narrow'},
		].map(({value, unit, style}) => rel('en', value, {unit, style} as any))).toEqual(expected);
	});
	
	it('should handle numeric', async () => {
		const cont = await render(html`
			<intl-rel-time unit="year" numeric="false">-1</intl-rel-time>
			<intl-rel-time unit="year" numeric="true">-1</intl-rel-time>
		`);
		
		const expected = [
			"last year",
			"1 year ago"
		];
		
		expect(cont.find('intl-rel-time').map(d => d.content)).toEqual(expected)
		expect([
			{value: -1, unit: 'year', numeric: false},
			{value: -1, unit: 'year', numeric: true},
		].map(({value, unit, numeric}) => rel('en', value, {unit, numeric} as any))).toEqual(expected)
	});
	
	it('should handle live', async () => {
		const time = Date.now();
		
		const cont = await render(html`
			<intl-rel-time live="true">${time}</intl-rel-time>
		`);
		
		const d = cont.find('intl-rel-time')[0];
		
		await wait();
		
		expect(d.content).toEqual("now");
		
		await wait(1000);
		
		expect(d.content).toEqual("1 second ago");
		
		d.unmount(); // should stop
		
		await wait(1000);
		
		expect(d.content).toEqual("1 second ago"); // remains the same
	});
	
})
