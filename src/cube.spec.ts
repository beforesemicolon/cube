import 'core-js/stable/structured-clone';
import {register, onAdoption, onDestroy, onMount, template} from "./cube";
import {Only} from "./helpers/only.helper";
import {html} from "./html";

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
})
