import {Cube} from "../types";
import * as cube from '../cube';
import initNumber from './intl-number';
import {render} from "../testing";
import {html, state} from "@beforesemicolon/web-component";
import {TC} from "../utils";

const CUBE = {
	...cube,
	TC,
	state
} as unknown as Cube

initNumber(CUBE)

describe('intl-number', () => {
	it('should return empty for invalid value', async () => {
		const cont = await render(html`
			<intl-number>str</intl-number>
			<intl-number value="str"></intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"",
			""
		])
	});
	
	it('should handle decimal', async () => {
		const cont = await render(html`
			<intl-number>20.0</intl-number>
			<intl-number value="2.5434"></intl-number>
			<intl-number value="-10"></intl-number>
			<intl-number>123456.789</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"20",
			"2.543",
			"-10",
			"123,456.789"
		])
	});
	
	it('should handle currency', async () => {
		const cont = await render(html`
			<intl-number type="currency" currency="USD">-20.0</intl-number>
			<intl-number type="currency" currency="USD" currency-display="symbol">20.0</intl-number>
			<intl-number type="currency" currency="USD" currency-display="code">20.0</intl-number>
			<intl-number type="currency" currency="USD" currency-display="name">20.0</intl-number>
			<intl-number type="currency" currency="USD" currency-sign="accounting">-20</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"-$20.00",
			"$20.00",
			"USD&nbsp;20.00",
			"20.00 US dollars",
			"($20.00)"
		])
	});
	
	it('should handle percentage', async () => {
		const cont = await render(html`
			<intl-number type="percent">0.4</intl-number>
			<intl-number type="percent">.25</intl-number>
			<intl-number type="percent">50</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"40%",
			"25%",
			"5,000%"
		])
	});
	
	it('should handle unit', async () => {
		const cont = await render(html`
			<intl-number type="unit" unit="percent">4</intl-number>
			<intl-number type="unit" unit="kilogram">4</intl-number>
			<intl-number type="unit" unit="hour">4</intl-number>
			<intl-number type="unit" unit-style="narrow" unit="liter">30</intl-number>
			<intl-number type="unit" unit-style="narrow" unit="degree">180</intl-number>
			<intl-number type="unit" unit-style="short" unit="degree">180</intl-number>
			<intl-number type="unit" unit-style="long" unit="degree">180</intl-number>
			<intl-number type="unit" unit-style="long" unit="percent">20</intl-number>
			<intl-number type="unit" unit-style="short" unit="percent">20</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"4%",
			"4kg",
			"4h",
			"30L",
			"180°",
			"180 deg",
			"180 degrees",
			"20 percent",
			"20%"
		])
	});
	
	it('should handle rounding', async () => {
		// node Intl is different from browser Intl
		// therefore, we can't test rounding properly
		const cont = await render(html`
			<intl-number value="2.28" decimal-digits="1" rounding="ceil"></intl-number>
			<intl-number value="2.28" decimal-digits="3" rounding="floor"></intl-number>
			<intl-number value="2.123444" significant-digits="1, 4" rounding="trunc"></intl-number>
			<intl-number value="2.123444" min-digits="2" rounding="ceil" rounding-inc="1000"></intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"2.3",
			"2.28",
			"2.123",
			"02.123"
		])
	});
	
	it('should handle notation', async () => {
		const cont = await render(html`
			<intl-number notation="engineering">232883928398293</intl-number>
			<intl-number notation="compact">232883928398293</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"232.884E12",
			"233T"
		])
	});
	
	it('should handle system', async () => {
		const cont = await render(html`
			<intl-number system="arab">232883928398293</intl-number>
			<intl-number system="guru">232883928398293</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"٢٣٢٬٨٨٣٬٩٢٨٬٣٩٨٬٢٩٣",
			"੨੩੨,੮੮੩,੯੨੮,੩੯੮,੨੯੩"
		])
	});
	
	it('should handle sign display', async () => {
		const cont = await render(html`
			<intl-number sign-display="auto">-2</intl-number>
			<intl-number sign-display="auto">-0</intl-number>
			<intl-number sign-display="auto">2</intl-number>
			<intl-number sign-display="always">2</intl-number>
			<intl-number sign-display="always">-2</intl-number>
			<intl-number sign-display="exceptZero">-2</intl-number>
			<intl-number sign-display="exceptZero">-0</intl-number>
			<intl-number sign-display="never">-7</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"-2",
			"-0",
			"2",
			"+2",
			"-2",
			"-2",
			"0",
			"7"
		])
	});
	
	it('should handle grouping style', async () => {
		const cont = await render(html`
			<intl-number grouping-style="auto">1000000</intl-number>
			<intl-number grouping-style="always">1000000</intl-number>
			<intl-number grouping-style="false">1000000</intl-number>
			<intl-number grouping-style="min2">1000000</intl-number>
			<intl-number grouping-style="true">1000000</intl-number>
		`);
		
		expect(cont.find('intl-number').map(d => d.content)).toEqual([
			"1,000,000",
			"1,000,000",
			"1000000",
			"1,000,000",
			"1,000,000"
		])
	});
})
