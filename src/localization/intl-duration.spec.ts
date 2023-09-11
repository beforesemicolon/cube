import {Cube} from "../types";
import * as cube from '../cube';
import initDuration from './intl-duration';
import initLocale from './intl-locale';
import {render} from "../testing";
import {html} from "@beforesemicolon/html";

initDuration(cube as unknown as Cube)
initLocale(cube as unknown as Cube)

describe('intl-duration', () => {
	beforeEach(() => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({
					title: 'Greetings {name}',
					description: 'Welcome to the test app',
				})
			} as Response)
		});
	})
	
	it('should render nothing if no value', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-duration></intl-duration>
			</intl-locale>`);
		
		expect(cont.find('intl-duration').map(d => d.content)).toEqual([""])
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
	});
})
