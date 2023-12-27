import {Cube} from "../types";
import * as cube from '../cube';
import initName from './intl-name';
import {render} from "../testing";
import {html, state} from "@beforesemicolon/web-component";
import {TC} from "../utils";

const CUBE = {
	...cube,
	TC,
	state
} as unknown as Cube

const n = initName(CUBE)

describe('intl-name', () => {
	it('should blank for no value', async () => {
		const cont = await render(html`
			<intl-name></intl-name>
			<intl-name value=""></intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual(["", ""])
	});
	
	it('should handle language in different styles', async () => {
		const cont = await render(html`
			<intl-name type="language">en-US</intl-name>
			<intl-name type="language" style="short" value="en-US"></intl-name>
			<intl-name type="language" style="narrow">en-US</intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual([
			"American English",
			"US English",
			"US English"
		])
	});
	
	it('should handle region in different styles', async () => {
		const cont = await render(html`
			<intl-name type="region">US</intl-name>
			<intl-name type="region" style="short" value="US"></intl-name>
			<intl-name type="region" style="narrow">US</intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual([
			"United States",
			"US",
			"US"
		])
	});
	
	it('should handle script in different styles', async () => {
		const cont = await render(html`
			<intl-name type="script">Latn</intl-name>
			<intl-name type="script" style="short" value="Latn"></intl-name>
			<intl-name type="script" style="narrow">Latn</intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual([
			"Latin",
			"Latin",
			"Latin"
		])
	});
	
	it('should handle dateTimeField in different styles', async () => {
		const cont = await render(html`
			<intl-name type="dateTimeField">year</intl-name>
			<intl-name type="dateTimeField" style="short" value="year"></intl-name>
			<intl-name type="dateTimeField" style="narrow">year</intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual([
			"year",
			"yr.",
			"yr"
		])
	});
	
	it('should handle currency in different styles', async () => {
		const cont = await render(html`
			<intl-name type="currency">USD</intl-name>
			<intl-name type="currency" style="short" value="USD" locale="pt"></intl-name>
			<intl-name type="currency" style="narrow">USD</intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual([
			"US Dollar",
			"Dólar americano",
			"US Dollar"
		])
	});
	
	it('should handle calendar in different styles', async () => {
		const cont = await render(html`
			<intl-name type="calendar">gregory</intl-name>
			<intl-name type="calendar" style="short" value="gregory"></intl-name>
			<intl-name type="calendar" style="narrow">gregory</intl-name>
		`);
		
		expect(cont.find('intl-name').map(d => d.content)).toEqual([
			"Gregorian Calendar",
			"Gregorian Calendar",
			"Gregorian Calendar"
		])
	});
})
