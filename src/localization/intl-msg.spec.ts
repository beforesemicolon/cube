import {Cube} from "../types";
import * as cube from '../cube';
import initLocale from './intl-locale';
import initMsg from './intl-msg';
import {element, html, state} from "@beforesemicolon/web-component";
import {render} from "../testing";
import {TC} from "../utils";

const CUBE = {
	...cube,
	element,
	html,
	TC,
	state
} as unknown as Cube

initLocale(CUBE)
const m = initMsg(CUBE)

describe('intl-msg', () => {
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
	
	it('should handle translations correctly', () => {
		expect(m({title: 'John Doe'}, 'title')).toBe('John Doe');
		expect(m({name: 'John Doe'}, 'title')).toBe('title');
		expect(m({greetings: 'Hello {name}'}, 'greetings')).toBe('Hello {name}');
		expect(m({greetings: 'Hello {name}'}, 'greetings', {name: 'John Doe'})).toBe('Hello John Doe');
	});
	
	it('should render text correctly', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-msg id="title" values="${({name: "John Doe"})}"></intl-msg>
				<intl-msg id="description"></intl-msg>
			</intl-locale>`);
		
		const [title, description] = cont.find('intl-msg');
		
		expect(title.content).toBe('Greetings <slot name="name">John Doe</slot>');
		expect(description.content).toBe('Welcome to the test app');
	});
	
	it('should render the id if no message found', async () => {
		const cont = await render(html`
			<intl-locale src="/en.json">
				<intl-msg id="titles" values="${({name: "John Doe"})}"></intl-msg>
			</intl-locale>`);
		
		const [title] = cont.find('intl-msg');
		
		expect(title.content).toBe('titles');
		expect(console.error).toHaveBeenCalledWith('[intl-msg] id of "titles" was not found. Rendering the id itself as backup.')
	});
})
