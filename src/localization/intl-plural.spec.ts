import {Cube} from "../types";
import * as cube from '../cube';
import initPlural from './intl-plural';
import {render} from "../testing";
import {state, html} from "@beforesemicolon/web-component";
import initLocale from "./intl-locale";
import {TC} from '../utils';

const CUBE = {
	...cube,
	html,
	state,
	TC
} as unknown as Cube

initLocale(CUBE)
const p = initPlural(CUBE)

describe('intl-plural', () => {
	const msgs = {
		"cube-intl": {
			plural: {
				other: "th",
				zero: "th",
				one: "st",
				two: "nd",
				few: "rd",
				many: "th",
			}
		}
	}
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		expect(p(msgs, 'en', 'simple', {zero: 'people', one: "person", other: 'person'})).toBe('')
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
		expect(p(msgs, 'en', 0, {zero: 'people', one: "person", other: 'people'})).toBe('people')
		expect(p(msgs, 'en', 1, {zero: 'people', one: "person", other: 'people'})).toBe('person')
		expect(p(msgs, 'en', 34, {zero: 'people', one: "person", other: 'people'})).toBe('people')
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
		
		expect(p(msgs,'en', 1, {two: 'nd', one: "st", other: 'th'}, 'ordinal')).toBe('1st')
		expect(p(msgs,'en', 2, {}, 'ordinal')).toBe('2nd')
		expect(p(msgs,'en', 3, {}, 'ordinal')).toBe('3rd')
		expect(p(msgs,'en', 4, {}, 'ordinal')).toBe('4th')
		expect(p(msgs,'en', 5, {}, 'ordinal')).toBe('5th')
	});
})
