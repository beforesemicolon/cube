import 'core-js/stable/structured-clone';
import {register, onAdoption, onDestroy, onMount, template, html} from "./cube";
import {Only} from "./helpers/only.helper";

describe('cube', () => {
	it('should handle lifecycles', () => {
		const mountMock = jest.fn();
		const destroyMock = jest.fn();
		const adoptionMock = jest.fn();
		
		const MyButton = () => {
			template`<button></button>`
			
			onMount(mountMock)
			onDestroy(destroyMock)
			onAdoption(adoptionMock)
		}
		
		const Button = register(MyButton, {value: 12});
		
		const btn = Button().createElement();
		
		document.body.appendChild(btn.self());
		
		expect(mountMock).toHaveBeenCalled();
		
		btn.attr("value", 20);
		
		// expect(updateMock).toHaveBeenCalledWith("value", 20, 12);
		
		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		
		iframe.contentDocument?.body.appendChild(btn.self())
		
		expect(adoptionMock).toHaveBeenCalled();
		
		btn.self().remove()
		
		expect(destroyMock).toHaveBeenCalled();
	});
	
	it('should have updated props object on update', () => {
		const updateMock = jest.fn();
		const CoolButton = (props: any) => {
			const element = document.createElement("button");
			
			return element;
		}
		
		const Button = register(CoolButton, {value: 12});
		
		const btn = Button().createElement();
		
		document.body.appendChild(btn.self());
		
		btn.attr("value", 20);
		
		expect(updateMock).toHaveBeenCalledWith({"value": 20})
	});
	
	it('should NOT allows update of props from component', () => {
		const updateMock = jest.fn();
		const PureButton = (props: any) => {
			const element = document.createElement("button");
			
			element.addEventListener("click", () => {
				props.value = 20;
			})
			
			return element;
		}
		
		const Button = register(PureButton, {value: 12});
		
		const btn = Button().createElement();
		
		document.body.appendChild(btn.self());
		
		btn.find("button")[0].self().click();
		
		// expect(btn.value).toBe(12)
	});
	
	describe("Only", () => {
		it('works when flat', () => {
			const TestComp = (props: any) => {
				template`${() => props.hidden ? "" : `<span>icon</span>`}`;
			}
			
			const Comp = register(TestComp, {hidden: false});
			
			const comp = Comp().createElement();
			
			document.body.appendChild(comp.self());
			
			expect(document.body.innerHTML).toBe("<test-comp></test-comp>");
			expect(comp.self().shadowRoot?.innerHTML.trim()).toBe('<span>icon</span>');

			comp.attr("hidden", true);

			expect(document.body.innerHTML).toBe("<test-comp hidden=\"\"></test-comp>");
			expect(comp.self().shadowRoot?.innerHTML.trim()).toBe('')

			comp.attr("hidden", false);

			expect(document.body.innerHTML).toBe("<test-comp></test-comp>");
			expect(comp.self().shadowRoot?.innerHTML.trim()).toBe('<span>icon</span>');
		});
		
		it('works when nested', () => {
			const TestComp = (props: any) => {
				template`${
					() => (props.top ? html`
						<span>sample ${html`text`}</span>
					` : "")
				}`;
			}
			
			const Comp = register(TestComp, {top: true, deep: false});
			
			const comp = Comp().createElement();
			
			document.body.appendChild(comp.self());
			
			expect(document.body.innerHTML).toBe("<test-comp></test-comp>");
			expect(comp.self().shadowRoot?.innerHTML.trim()).toBe('<span>sample text</span>');

			comp.attr("top", false);

			expect(document.body.innerHTML).toBe("<test-comp top=\"false\"></test-comp>");
			expect(comp.self().shadowRoot?.innerHTML.trim()).toBe('');

			comp.attr("top", true);

			expect(document.body.innerHTML).toBe("<test-comp top=\"true\"></test-comp>");
			expect(comp.self().shadowRoot?.innerHTML.trim()).toBe('<span>sample text</span>');
		});
	})
	
	describe('html', () => {
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
	});
})
