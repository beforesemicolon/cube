import {Cube} from "../types";
import * as cube from '../cube';

import initLocale from './intl-locale';
import {render} from "../testing";
import {html} from "@beforesemicolon/html";

initLocale(cube as unknown as Cube)

describe('intl-locale', () => {
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
