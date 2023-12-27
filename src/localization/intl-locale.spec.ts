import {Cube} from "../types";
import * as cube from '../cube';

import initLocale from './intl-locale';
import {render} from "../testing";
import {html} from "@beforesemicolon/web-component";

const locale = initLocale(cube as unknown as Cube)

describe('intl-locale', () => {
	it('should return correct lang and msgs', () => {
		expect(locale.lang).toBe('en');
		expect(locale.messages).toEqual({
			"cube-intl": {
				"day": {
					"narrow": "day",
					"plural": "days",
					"short": "day",
					"single": "day"
				},
				"hour": {
					"narrow": "h",
					"plural": "hours",
					"short": "hr",
					"single": "hour"
				},
				"millisecond": {
					"narrow": "ms",
					"plural": "milliseconds",
					"short": "mils",
					"single": "millisecond"
				},
				"minute": {
					"narrow": "min",
					"plural": "minutes",
					"short": "min",
					"single": "minute"
				},
				"month": {
					"narrow": "m",
					"plural": "months",
					"short": "month",
					"single": "month"
				},
				"nanosecond": {
					"narrow": "ns",
					"plural": "nanoseconds",
					"short": "nano",
					"single": "nanosecond"
				},
				"plural": {
					"few": "rd",
					"many": "th",
					"one": "st",
					"other": "th",
					"two": "nd",
					"zero": "th"
				},
				"second": {
					"narrow": "s",
					"plural": "seconds",
					"short": "sec",
					"single": "second"
				},
				"week": {
					"narrow": "week",
					"plural": "weeks",
					"short": "week",
					"single": "week"
				},
				"year": {
					"narrow": "yr",
					"plural": "years",
					"short": "year",
					"single": "year"
				}
			}
		});
	});
	it('should load translation file with src', async () => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({})
			} as Response)
		});
		
		await render(html`<intl-locale src="/locales/en.json"></intl-locale>`);
		
		expect(window.fetch).toHaveBeenCalledWith('http://localhost/locales/en.json');
		expect(console.error).not.toHaveBeenCalled();
	});
	
	it('should fail to load translation file with src', async () => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 404,
				json: () => Promise.resolve({})
			} as Response)
		});
		
		await render(html`<intl-locale src="/locales/en.json"></intl-locale>`);
		
		expect(window.fetch).toHaveBeenCalledWith('http://localhost/locales/en.json');
		expect(console.error).toHaveBeenCalledWith(new Error('[intl-locale] Loading "/locales/en.json" locale messages failed with status code 404'));
	});
	
	it('should load translation file with srcDir', async () => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 200,
				json: () => Promise.resolve({})
			} as Response)
		});
		
		await render(html`<intl-locale src-dir="/locales"></intl-locale>`);
		
		expect(window.fetch).toHaveBeenCalledWith('http://localhost/locales/en.json');
		expect(console.error).not.toHaveBeenCalled();
	});
	
	it('should fail to load translation file with srcDir', async () => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 404,
				json: () => Promise.resolve({})
			} as Response)
		});
		
		await render(html`<intl-locale src-dir="/locales"></intl-locale>`);
		
		expect(window.fetch).toHaveBeenCalledWith('http://localhost/locales/en.json');
		expect(console.error).toHaveBeenCalledWith(new Error('[intl-locale] Loading "/locales/en.json" locale messages failed with status code 404'));
	});
})
