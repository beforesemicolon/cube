import 'core-js/stable/structured-clone';
import {register, onAdoption, onDestroy, onMount, onBeforeUpdate, onAfterUpdate, template, useValue} from "./cube";
import {Props} from "./types";

describe('cube', () => {

	it('should handle lifecycles', () => {
		const mountMock = jest.fn();
		const beforeUpdateMock = jest.fn();
		const afterUpdateMock = jest.fn();
		const destroyMock = jest.fn();
		const adoptionMock = jest.fn();

		interface ButtonProps {
			type: "button" | "submit"
		}

		const MyButton = ({type}: Props<ButtonProps>) => {
			template`<button type="${type}"><slot></slot></button>`

			onMount(mountMock)
			onBeforeUpdate(beforeUpdateMock)
			onAfterUpdate(afterUpdateMock)
			onDestroy(destroyMock)
			onAdoption(adoptionMock)
		}

		register<ButtonProps>(MyButton, {type: "button"});

		const btn = document.createElement("my-button");

		document.body.appendChild(btn);

		expect(document.body.innerHTML).toBe('<my-button></my-button>')
		expect(btn.shadowRoot?.innerHTML).toBe('<button type="button"><slot></slot></button>')

		expect(mountMock).toHaveBeenCalledTimes(1);

		btn.setAttribute("type", "submit");

		expect(btn.shadowRoot?.innerHTML).toBe('<button type="submit"><slot></slot></button>')

		expect(beforeUpdateMock).toHaveBeenCalledTimes(1);
		expect(afterUpdateMock).toHaveBeenCalledTimes(1);

		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);

		iframe.contentDocument?.body.appendChild(btn)

		expect(destroyMock).toHaveBeenCalledTimes(1);
		expect(adoptionMock).toHaveBeenCalledTimes(1);
		expect(mountMock).toHaveBeenCalledTimes(2);

		btn.remove()

		expect(destroyMock).toHaveBeenCalledTimes(2);
	});

	describe("should throw error if", () => {
		it('onDestroy is used outside component', () => {
		});

		it('onMount is used outside component', () => {
		});

		it('onBeforeUpdate is used outside component', () => {
		});

		it('onAfterUpdate is used outside component', () => {
		});

		it('template is used outside component', () => {
		});

		it('style is used outside component', () => {
		});

		it('eventDispatch is used outside component', () => {
		});

		it('useValue is used outside component', () => {
		});
	})

	it('useValue should update template', () => {
	});

	it('eventDispatch should dispatch event', () => {
	});

	it('style should define component CSS', () => {
	});
	
	it('should handle passing primitive to a component', () => {
		const ChildComp = ({val}: Props<{val: number}>) => {
			template`${val}`
		}
		
		const ParentComp = () => {
			template`<child-comp val="12"></child-comp>`
		}
		
		register<{val: number}>(ChildComp, {
			val: 0
		})
		register(ParentComp)
		
		document.body.innerHTML = "<parent-comp></parent-comp>";
		
		const el = document.body.children[0];
		
		expect(el.shadowRoot?.innerHTML).toBe('<child-comp val="12"></child-comp>')
		expect(el.shadowRoot?.children[0].shadowRoot?.innerHTML).toBe('12')
	});
	
	it('should handle passing non-primitive to a component', () => {
		const DeepComp = ({val}: Props<{val: {sample: string}}>) => {
			template`${() => val().sample}`
		}
		
		const TopComp = () => {
			template`<deep-comp val="${{sample: 12}}"></deep-comp>`
		}
		
		register<{val: {sample: string}}>(DeepComp, {
			val: {
				sample: ""
			}
		})
		register(TopComp)
		
		document.body.innerHTML = "<top-comp></top-comp>";
		
		const el = document.body.children[0];
		
		expect(el.shadowRoot?.innerHTML).toBe('<deep-comp val="{&quot;sample&quot;:12}"></deep-comp>')
		expect(el.shadowRoot?.children[0].shadowRoot?.innerHTML).toBe('12')
	});
})
