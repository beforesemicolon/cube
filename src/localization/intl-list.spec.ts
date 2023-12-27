import {Cube} from "../types";
import * as cube from '../cube';
import initList, {IntlListProps} from './intl-list';
import {render} from "../testing";
import {html, state} from "@beforesemicolon/web-component";
import {TC} from "../utils";

const CUBE = {
	...cube,
	TC,
	state
} as unknown as Cube

const l = initList(CUBE)

describe('intl-list', () => {
	const items = ['book', 'pen', 'pencil'];
	
	it('should handle conjunctions', async () => {
		const cont = await render(html`
			<intl-list items="${items}" type="conjunction"></intl-list>
			<intl-list items="${items}" type="and"></intl-list>
		`);
		
		
		expect(cont.find('intl-list').map(d => d.content)).toEqual([
			"book, pen, and pencil",
			"book, pen, and pencil"
		])
		expect(l('en', items)).toEqual("book, pen, and pencil")
	});
	
	it('should handle disjunctions', async () => {
		const cont = await render(html`
			<intl-list items="${items}" type="disjunction"></intl-list>
			<intl-list items="${items}" type="or"></intl-list>
		`);
		
		expect(cont.find('intl-list').map(d => d.content)).toEqual([
			"book, pen, or pencil",
			"book, pen, or pencil"
		])
		expect(l('en', items, "or")).toEqual("book, pen, or pencil")
		expect(l('en', items, "disjunction")).toEqual("book, pen, or pencil")
	});
	
	it('should handle unit', async () => {
		const cont = await render(html`
			<intl-list items="${items}" type="unit"></intl-list>
			<intl-list items="${items}" type="none"></intl-list>
		`);
		
		expect(cont.find('intl-list').map(d => d.content)).toEqual([
			"book, pen, pencil",
			"book, pen, pencil"
		])
		expect(l('en', items, "none")).toEqual("book, pen, pencil")
		expect(l('en', items, "unit")).toEqual("book, pen, pencil")
	});
	
	it('should handle style', async () => {
		const cont = await render(html`
			<intl-list items="${items}" type="and" style="long"></intl-list>
			<intl-list items="${items}" type="and" style="short"></intl-list>
			<intl-list items="${items}" type="and" style="narrow"></intl-list>
		`);
		
		expect(cont.find('intl-list').map(d => d.content)).toEqual([
			"book, pen, and pencil",
			"book, pen, &amp; pencil",
			"book, pen, pencil"
		])
		expect(["long", "short", "narrow"].map(style => l('en', items, "and", style as IntlListProps['style']))).toEqual([
			"book, pen, and pencil",
			"book, pen, & pencil",
			"book, pen, pencil"
		])
	});
})
