import {html} from "./html";
import {before} from "node:test";

describe("html", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	})

	it('should render static text', () => {
		const temp = html`sample`;

		temp.render(document.body);

		expect(document.body.innerHTML).toBe('sample');
	});

	it('should render dynamic text and update', () => {
		let x = 15;

		const temp = html`${() => x > 10 ? "more than 10" : "less than 10"}`;

		temp.render(document.body);

		expect(document.body.innerHTML).toBe('more than 10');

		x = 5;

		temp.render();

		expect(document.body.innerHTML).toBe('less than 10');
	});

	it('should render html', () => {
		const button = html`<button>click me</button>`;

		button.render(document.body);

		expect(document.body.innerHTML).toBe('<button>click me</button>');
	});

	it('should render html with dynamic attr value', () => {
		let type = "button"
		const button = html`<button type="${() => type}">click me</button>`;

		button.render(document.body);

		expect(document.body.innerHTML).toBe('<button type="button">click me</button>');

		type = "submit";

		button.render();

		expect(document.body.innerHTML).toBe('<button type="submit">click me</button>');
	});

	it('should render dynamic html', () => {
		let value = "sample";
		let edit = false;
		const val = html`${() => edit ? `<input type="text" value="${value}"/>` : `<p>${value}</p>`}`;

		val.render(document.body);

		expect(document.body.innerHTML).toBe('<p>sample</p>');

		edit = true;

		val.render();

		expect(document.body.innerHTML).toBe('<input type="text" value="sample">');
	});

	it('should render nested html 2 levels', () => {
		const list = html`<ul>${html`${[1, 2, 3].map(i => `<li>item-${i}</li>`).join('&nbsp;')}`}</ul>`;

		list.render(document.body);

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li>&nbsp;<li>item-3</li></ul>')
	});

	it('should render nested html 2 levels with dynamic inner level', () => {
		let items = [1, 2, 3];
		const list = html`<ul>${() => items.map(i => `<li>item-${i}</li>`).join('&nbsp;')}}</ul>`;

		list.render(document.body);

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li>&nbsp;<li>item-3</li></ul>');

		items = [1];

		list.render();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li></ul>');

		items = [1, 2];

		list.render();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li></ul>');

		items = [];

		list.render();

		expect(document.body.innerHTML).toBe('<ul></ul>');

		items = [1, 2, 3];

		list.render();

		expect(document.body.innerHTML).toBe('<ul><li>item-1</li>&nbsp;<li>item-2</li>&nbsp;<li>item-3</li></ul>');
	});

	it('should render nested html 3 levels', () => {
		const deep = html`<ul>${html`<li>${html`<span>${html`sample`}</span>`}</li>`}</ul>`;

		deep.render(document.body);

		expect(document.body.innerHTML).toBe('<ul><li><span>sample</span></li></ul>')
	});

	it('should handle event attribute with fn value and event options', () => {
		const clickMock = jest.fn();

		const btn = html`<button onclick="${clickMock}, true">click me</button>`;

		btn.render(document.body);

		const btnElement = btn.nodes[0] as HTMLButtonElement;

		expect(document.body.innerHTML).toBe('<button>click me</button>');

		btnElement.click();

		expect(clickMock).toHaveBeenCalled()
	});

	it('should trow error if handle event attribute is not a function', () => {
		const btn = html`<button onclick="${2}">click me</button>`;

		expect(() => btn.render(document.body))
			.toThrowError('handler for event "onclick" is not a function. Found 2.');
	});

	it('should handle ref directive', () => {
		const btn = html`<button ref="btn"><span ref="span">click me</span></button>`;

		const btnElement = btn.refs.get("btn");
		const spanElement = btn.refs.get("span");

		expect(btnElement).toBeInstanceOf(HTMLButtonElement)
		expect(spanElement).toBeInstanceOf(HTMLSpanElement)
	});

	it('should handle attr attribute', () => {
		const btn = html`
			<button attr.disabled="${true}" attr.class.loading="${true}">
				<span attr.style="color: #900;, ${true}" attr.style.font-style="bold, ${true}">click me</span>
			</button>
		`;

		btn.render(document.body)
	});
})