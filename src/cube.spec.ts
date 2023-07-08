import 'core-js/stable/structured-clone';
import {register, onAdoption, onDestroy, onMount, template} from "./cube";
import {html} from "@beforesemicolon/html";

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
		
		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		
		iframe.contentDocument?.body.appendChild(btn.self())
		
		expect(adoptionMock).toHaveBeenCalled();
		
		btn.self().remove()
		
		expect(destroyMock).toHaveBeenCalled();
	});
})
