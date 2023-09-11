import {Cube} from "../types";
import * as cube from '../cube';
import initPlural from './intl-plural';
import {render} from "../testing";
import {element, html} from "@beforesemicolon/html";
import initLocale from "./intl-locale";

const CUBE = {
	...cube,
	html
} as unknown as Cube

initPlural(CUBE)
initLocale(CUBE)

describe('intl-plural', () => {
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
	
	it('should be empty for non numeric value', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-plural zero="people" one="person" other="people" value="simple"></intl-plural>
				<intl-plural zero="people" one="person" other="people">test</intl-plural>
			</intl-locale>`);
		
		expect(cont.find('intl-plural').map(d => d.content)).toEqual([
			"",
			""
		])
	});
	
	it('should render cardinal values', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-plural zero="people" one="person" other="people" value="0"></intl-plural>
				<intl-plural zero="people" one="person" other="people" value="34"></intl-plural>
				<intl-plural zero="people" one="person" other="people" value="1"></intl-plural>
			</intl-locale>`);
		
		expect(cont.find('intl-plural').map(d => d.content)).toEqual([
			"people",
			"people",
			"person"
		])
	});
	
	it('should render ordinal values', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-plural type="ordinal">1</intl-plural>
				<intl-plural one="st" two="nd" other="th" type="ordinal">2</intl-plural>
				<intl-plural type="ordinal" value="3">
					<sup slot="few">rd</sup>
				</intl-plural>
				<intl-plural type="ordinal" value="4"></intl-plural>
				<intl-plural type="ordinal" value="5"></intl-plural>
			</intl-locale>`);
		
		expect(cont.find('intl-plural').map(d => d.content)).toEqual([
			'1<slot name="one">st</slot>',
			'2<slot name="two">nd</slot>',
			'3<slot name="few">rd</slot>',
			'4<slot name="other">th</slot>',
			'5<slot name="other">th</slot>'
		])
	});
})
