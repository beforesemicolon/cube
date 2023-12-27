import {Cube} from "../types";
import * as cube from '../cube';
import initDate from './intl-datetime';
import {render} from "../testing";
import {html, state} from "@beforesemicolon/web-component";
import {TC} from "../utils";

const CUBE = {
	...cube,
	TC,
	state
} as unknown as Cube

const dt = initDate(CUBE)

describe('intl-datetimetime', () => {
	it('should render invalid date', async () => {
		const cont = await render(html`
			<intl-datetime>some string</intl-datetime>
			<intl-datetime>23/20/2020</intl-datetime>`);
		
		const [d1, d2] = cont.find('intl-datetime');
		
		expect(d1.content).toBe('[Invalid Date: some string]')
		expect(d2.content).toBe('[Invalid Date: 23/20/2020]')
		expect(dt('en', 'some string')).toBe('[Invalid Date: some string]')
		expect(dt('en', '23/20/2020')).toBe('[Invalid Date: 23/20/2020]')
	});
	
	it('should render default', async () => {
		const cont = await render(html`
			<intl-datetime></intl-datetime>`);
		
		const [d1] = cont.find('intl-datetime');
		
		// it will render current date and time
		// as long as it not blank or invalid date should be good
		expect(d1.content).not.toBe('')
		expect(d1.content).not.toBe('[Invalid Date: ]')
		expect(dt('en', '')).not.toBe('')
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		expect(dt('en', null)).toBe('')
	});
	
	it('should handle 12/24 format', async () => {
		const cont = await render(html`
			<intl-datetime>1694304564082</intl-datetime>
			<intl-datetime hour12="true">1694304564082</intl-datetime>`);
		
		const [d1, d2] = cont.find('intl-datetime');
		
		expect(d1.content).toBe('Sat, 9/9/2023, 20:09:24')
		expect(d2.content).toBe('Sat, 9/9/2023, 8:09:24 in the evening')
		expect(dt('en', '1694304564082')).toBe('Sat, 9/9/2023, 20:09:24')
		expect(dt('en', '1694304564082', {hour12: true})).toBe('Sat, 9/9/2023, 8:09:24 in the evening')
	});
	
	it('should render with individual format', async () => {
		const cont = await render(html`
			<!-- era -->
			<intl-datetime era="short" value="1694326144082"></intl-datetime>
			<intl-datetime era="long" value="1694326144082"></intl-datetime>
			<intl-datetime era="narrow" value="1694326144082"></intl-datetime>
			<!-- year -->
			<intl-datetime year="numeric" value="1694326144082"></intl-datetime>
			<intl-datetime year="2-digit" value="1694326144082"></intl-datetime>
			<!-- month -->
			<intl-datetime month="numeric" value="1694326144082"></intl-datetime>
			<intl-datetime month="2-digit" value="1694326144082"></intl-datetime>
			<intl-datetime month="long" value="1694326144082"></intl-datetime>
			<intl-datetime month="short" value="1694326144082"></intl-datetime>
			<intl-datetime month="narrow" value="1694326144082"></intl-datetime>
			<!-- day -->
			<intl-datetime day="numeric" value="1694326144082"></intl-datetime>
			<intl-datetime day="2-digit" value="1694326144082"></intl-datetime>
			<!-- weekday -->
			<intl-datetime weekday="short" value="1694326144082"></intl-datetime>
			<intl-datetime weekday="long" value="1694326144082"></intl-datetime>
			<intl-datetime weekday="narrow" value="1694326144082"></intl-datetime>
			<!-- hour -->
			<intl-datetime hour="numeric" value="1694326144082"></intl-datetime>
			<intl-datetime hour="2-digit" value="1694326144082"></intl-datetime>
			<!-- minute -->
			<intl-datetime minute="numeric" value="1694326144082"></intl-datetime>
			<intl-datetime minute="2-digit" value="1694326144082"></intl-datetime>
			<!-- second -->
			<intl-datetime second="numeric" value="1694326144082"></intl-datetime>
			<intl-datetime second="2-digit" value="1694326144082"></intl-datetime>
		`);
		
		const expected = [
			// era
			"Sun, 9 10, 2023 AD, 02:09:04",
			"Sun, 9 10, 2023 Anno Domini, 02:09:04",
			"Sun, 9 10, 2023 A, 02:09:04",
			// year
			"Sun, 9/10/2023, 02:09:04",
			"Sun, 9/10/23, 02:09:04",
			// month
			"Sun, 9/10/2023, 02:09:04",
			"Sun, 09/10/2023, 02:09:04",
			"Sun, September 10, 2023 at 02:09:04",
			"Sun, Sep 10, 2023, 02:09:04",
			"Sun, S 10, 2023, 02:09:04",
			// day
			"Sun, 9/10/2023, 02:09:04",
			"Sun, 9/10/2023, 02:09:04",
			// weekday
			"Sun, 9/10/2023, 02:09:04",
			"Sunday, 9/10/2023, 02:09:04",
			"S, 9/10/2023, 02:09:04",
			// hour
			"Sun, 9/10/2023, 02:09:04",
			"Sun, 9/10/2023, 02:09:04",
			// minute
			"Sun, 9/10/2023, 02:09:04",
			"Sun, 9/10/2023, 02:09:04",
			// second
			"Sun, 9/10/2023, 02:09:04",
			"Sun, 9/10/2023, 02:09:04"
		]
		
		expect(cont.find('intl-datetime').map(d => d.content)).toEqual(expected)
		expect([
			{era: "short", value: "1694326144082"},
			{era: "long", value: "1694326144082"},
			{era: "narrow", value: "1694326144082"},
			{year: "numeric", value: "1694326144082"},
			{year: "2-digit", value: "1694326144082"},
			{month: "numeric", value: "1694326144082"},
			{month: "2-digit", value: "1694326144082"},
			{month: "long", value: "1694326144082"},
			{month: "short", value: "1694326144082"},
			{month: "narrow", value: "1694326144082"},
			{day: "numeric", value: "1694326144082"},
			{day: "2-digit", value: "1694326144082"},
			{weekday: "short", value: "1694326144082"},
			{weekday: "long", value: "1694326144082"},
			{weekday: "narrow", value: "1694326144082"},
			{hour: "numeric", value: "1694326144082"},
			{hour: "2-digit", value: "1694326144082"},
			{minute: "numeric", value: "1694326144082"},
			{minute: "2-digit", value: "1694326144082"},
			{second: "numeric", value: "1694326144082"},
			{second: "2-digit", value: "1694326144082"},
		]
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
			.map(({value, ...opt}) => dt('en', value, opt))).toEqual(expected)
	});
	
	it('should render with time and date style', async () => {
		const cont = await render(html`
			<!-- date-style -->
			<intl-datetime date-style="full">1694326144082</intl-datetime>
			<intl-datetime date-style="long">1694326144082</intl-datetime>
			<intl-datetime date-style="medium">1694326144082</intl-datetime>
			<intl-datetime date-style="short">1694326144082</intl-datetime>
			<!-- time-style -->
			<intl-datetime time-style="full">1694326144082</intl-datetime>
			<intl-datetime time-style="long">1694326144082</intl-datetime>
			<intl-datetime time-style="medium">1694326144082</intl-datetime>
			<intl-datetime time-style="short">1694326144082</intl-datetime>
			<!-- both -->
			<intl-datetime date-style="full" time-style="full">1694326144082</intl-datetime>
			<intl-datetime date-style="long" time-style="long">1694326144082</intl-datetime>
			<intl-datetime date-style="medium" time-style="medium">1694326144082</intl-datetime>
			<intl-datetime date-style="short" time-style="short">1694326144082</intl-datetime>
		`);
		
		const expected = [
			// date-style
			"Sunday, September 10, 2023",
			"September 10, 2023",
			"Sep 10, 2023",
			"9/10/23",
			// time-style
			"02:09:04 Eastern Daylight Time",
			"02:09:04 EDT",
			"02:09:04",
			"02:09",
			// both
			"Sunday, September 10, 2023 at 02:09:04 Eastern Daylight Time",
			"September 10, 2023 at 02:09:04 EDT",
			"Sep 10, 2023, 02:09:04",
			"9/10/23, 02:09"
		];
		
		expect(cont.find('intl-datetime').map(d => d.content)).toEqual(expected)
		expect([
			{dateStyle: "full", value: "1694326144082"},
			{dateStyle: "long", value: "1694326144082"},
			{dateStyle: "medium", value: "1694326144082"},
			{dateStyle: "short", value: "1694326144082"},
			{timeStyle: "full", value: "1694326144082"},
			{timeStyle: "long", value: "1694326144082"},
			{timeStyle: "medium", value: "1694326144082"},
			{timeStyle: "short", value: "1694326144082"},
			{dateStyle: "full", timeStyle: "full", value: "1694326144082"},
			{dateStyle: "long", timeStyle: "long", value: "1694326144082"},
			{dateStyle: "medium", timeStyle: "medium", value: "1694326144082"},
			{dateStyle: "short", timeStyle: "short", value: "1694326144082"},
		]
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
			.map(({value, ...opt}) => dt('en', value, opt))).toEqual(expected)
	});
	
	it('should handle day period', async () => {
		const cont = await render(html`
			<intl-datetime hour12="true" hour-cycle="h12" day-period="long">1355716842000</intl-datetime>
			<intl-datetime hour12="true" hour-cycle="h12" day-period="short">1355716842000</intl-datetime>
			<intl-datetime hour12="true" hour-cycle="h12" day-period="narrow">1355716842000</intl-datetime>
		`);
		
		const expected = [
			"Sun, 12/16/2012, 11:00:42 at night",
			"Sun, 12/16/2012, 11:00:42 at night",
			"Sun, 12/16/2012, 11:00:42 at night"
		]
		
		expect(cont.find('intl-datetime').map(d => d.content)).toEqual(expected);
		expect([
			{hour12: "true", hourCycle: "h12", dayPeriod: "long", value: "1355716842000"},
			{hour12: "true", hourCycle: "h12", dayPeriod: "short", value: "1355716842000"},
			{hour12: "true", hourCycle: "h12", dayPeriod: "narrow", value: "1355716842000"},
		]
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
			.map(({value, ...opt}) => dt('en', value, opt))).toEqual(expected)
	});
	
	it('should handle hour cycle', async () => {
		const cont = await render(html`
			<intl-datetime hour-cycle="h11" hour12="true">1355716842000</intl-datetime>
			<intl-datetime hour-cycle="h12" hour12="true">1355716842000</intl-datetime>
			<intl-datetime hour-cycle="h23">1355716842000</intl-datetime>
		`);
		
		const expected = [
			"Sun, 12/16/2012, 11:00:42 at night",
			"Sun, 12/16/2012, 11:00:42 at night",
			"Sun, 12/16/2012, 23:00:42"
		];
		
		expect(cont.find('intl-datetime').map(d => d.content)).toEqual(expected)
		expect([
			{hourCycle: "h11", hour12: "true", value: "1355716842000"},
			{hourCycle: "h12", hour12: "true", value: "1355716842000"},
			{hourCycle: "h23", value: "1355716842000"},
		]
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
			.map(({value, ...opt}) => dt('en', value, opt))).toEqual(expected)
	});
	
	it('should handle calendar', async () => {
		const cont = await render(html`
			<intl-datetime calendar="chinese" locale="zh">1355716842000</intl-datetime>
			<intl-datetime calendar="hebrew" locale="he">1355716842000</intl-datetime>
			<intl-datetime calendar="islamic" locale="ar">1355716842000</intl-datetime>
			<intl-datetime calendar="gregory">1355716842000</intl-datetime>
		`);
		
		const expected = [
			"2012壬辰年十一月4，周日 23:00:42",
			"יום א׳, 3 בטבת 5773, 23:00:42",
			"الأحد، ٣‏/٢‏/١٤٣٤ هـ، ٢٣:٠٠:٤٢",
			"Sun, 12/16/2012, 23:00:42"
		]
		
		expect(cont.find('intl-datetime').map(d => d.content)).toEqual(expected)
		expect([
			{calendar: "chinese", locale: "zh", value: "1355716842000"},
			{calendar: "hebrew", locale: "he", value: "1355716842000"},
			{calendar: "islamic", locale: "ar", value: "1355716842000"},
			{calendar: "gregory", value: "1355716842000"},
		]
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
			.map(({value, locale = 'en', ...opt}) => dt(locale, value, opt))).toEqual(expected)
	});
	
	it('should handle timezone', async () => {
		const cont = await render(html`
			<intl-datetime timezone="America/New_York">1355716842000</intl-datetime>
			<intl-datetime timezone="UTC">1355716842000</intl-datetime>
		`);
		
		const expected = [
			"Sun, 12/16/2012, 23:00:42",
			"Mon, 12/17/2012, 04:00:42"
		];
		
		expect(cont.find('intl-datetime').map(d => d.content)).toEqual(expected)
		expect([
			{timezone:"America/New_York", value: "1355716842000"},
			{timezone:"UTC", value: "1355716842000"}
		]
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
			.map(({value, ...opt}) => dt('en', value, opt))).toEqual(expected)
	});
	
})
