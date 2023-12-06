import {Cube} from "../../types";
import * as cube from '../../cube';
import initWithRoute from './with-route';
import {render, waitFor} from "../../testing";
import {html, when, state} from "@beforesemicolon/markup";
import {goToPage} from "../../router/pages";

initWithRoute({...cube, html, when, state} as unknown as Cube)

describe('WithRoute', () => {
	beforeEach(() => {
		goToPage('/');
	})
	
	it('should render inner content with route', async () => {
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 200,
				text: () => Promise.resolve('<p>Hello World</p>')
			} as Response)
		});
		
		const cont = await render(html`
			<with-route path="/">Hello World</with-route>
			<with-route path="/test" src="/test"></with-route>`);
		
		expect(window.fetch).not.toHaveBeenCalled();
		
		const [r1, r2] = cont.find('with-route');
		
		expect(r1.content.trim()).toBe('<slot></slot>')
		expect(r1.toString()).toBe('<with-route path="/">Hello World</with-route>')
		
		let slot = r2.find('slot')[0];
		expect(slot.target.getAttribute('name')).toMatch(/\d+/)
		expect(r2.toString()).toBe('<with-route path="/test" src="/test"></with-route>')

		expect(r2.find('slot[name="loading"]')[0]).not.toBeDefined();

		await waitFor(() => {
			goToPage('/test');
			// show loading slot
			expect(r2.find('slot[name="loading"]')[0]).toBeDefined();
		})

		// r1 slot gets a name to hide content
		slot = r1.find('slot')[0];
		expect(slot.target.getAttribute('name')).toMatch(/\d+/)
		expect(r1.toString()).toBe('<with-route path="/">Hello World</with-route>')

		// r2 slot loses the name to show content
		expect(r2.content.trim()).toBe('<slot></slot>')
		// the content is placed inside
		expect(r2.toString()).toBe('<with-route path="/test" src="/test"><p>Hello World</p></with-route>')
	});
	
	it('should fail to load content and show fallback slot', async () => {
		jest.spyOn(console, 'error');
		jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
			return Promise.resolve({
				status: 404
			} as Response)
		});
		
		const cont = await render(html`
			<with-route path="/test" src="/test"></with-route>`);
		
		const [r1] = cont.find('with-route');
		
		let slot = r1.find('slot')[0];
		expect(slot.target.getAttribute('name')).toMatch(/\d+/)
		expect(r1.toString()).toBe('<with-route path="/test" src="/test"></with-route>')
		
		expect(r1.find('slot[name="loading"]')[0]).not.toBeDefined();
		expect(r1.find('slot[name="fallback"]')[0]).not.toBeDefined();
		
		await waitFor(() => {
			goToPage('/test');
			// show loading slot
			expect(r1.find('slot[name="loading"]')[0]).toBeDefined();
		})
		
		expect(console.error).toHaveBeenCalledWith(new Error('Loading "/test" content failed with status code 404'));
		// hide loading slot
		expect(r1.find('slot[name="loading"]')[0]).not.toBeDefined();
		// show fallback slot
		expect(r1.find('slot[name="fallback"]')[0]).toBeDefined();
	})
})
