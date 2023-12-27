import {render, wait, waitFor} from './index';
import {element, html} from "@beforesemicolon/web-component";
import {template} from "../cube";

describe('testing', () => {
	it('should render string', async () => {
		const cont = await render('Hello World');

		expect(cont.content).toBe('Hello World')
		expect(cont.toString()).toBe('<body>Hello World</body>')
	})
	
	it('should render Element/HTMLElement', async () => {
		const cont = await render(element('p', {textContent: "Hello World"}));
		
		expect(cont.content).toBe('Hello World')
		expect(cont.toString()).toBe('<p>Hello World</p>')
		expect(cont.target).toBeInstanceOf(HTMLParagraphElement)
		
		const listener = jest.fn();
		
		cont.on('click', listener);
		
		cont.target.dispatchEvent(new Event('click'));
		
		expect(listener).toBeCalledTimes(1)
	})
	
	it('should render Node', async () => {
		const cont = await render(document.createTextNode('Hello World'));
		
		expect(cont.content).toBe('Hello World')
		expect(cont.toString()).toBe('<body>Hello World</body>')
		expect(cont.target).toBeInstanceOf(HTMLBodyElement)
	})
	
	it('should render HtmlTemplate', async () => {
		const cont = await render(html`<p>Hello World</p>`);
		
		expect(cont.content).toBe('<p>Hello World</p>')
		expect(cont.toString()).toBe('<body><p>Hello World</p></body>')
		expect(cont.target).toBeInstanceOf(HTMLBodyElement)
	})
	
	it('should render component function', async () => {
		const MyButton = () => {
			template`<p>Hello World</p>`
		}
		
		const cont = await render(MyButton);
		
		expect(cont.content).toBe('<p>Hello World</p>')
		expect(cont.toString()).toBe('<my-button></my-button>')
		expect(cont.target).toBeInstanceOf(HTMLElement)
	})
	
	it('should wait 1000', async () => {
		let start = 0;
		
		setTimeout(() => {
			start = 3000;
		}, 500);
		
		expect(start).toBe(0)
		
		await wait(500);
		
		expect(start).toBe(3000)
	});
	
	it('should waitFor', async () => {
		let start = 0;
		
		expect(start).toBe(0)
		
		const res = await waitFor(() => new Promise((res) => {
			setTimeout(() => {
				start = 3000;
				res(start);
			}, 500)
		}));
		
		expect(start).toBe(3000)
		expect(res).toBe(3000)
	});
	
})
