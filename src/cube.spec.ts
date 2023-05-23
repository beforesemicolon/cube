import {Cube, onAdoption, onDestroy, onMount, onUpdate} from "./cube";

describe('cube', () => {
	it('should handle lifecycles', () => {
		const mountMock = jest.fn();
		const destroyMock = jest.fn();
		const updateMock = jest.fn();
		const adoptionMock = jest.fn();
		
		const MyButton = () => {
			const element = document.createElement("button");
			
			onMount(mountMock)
			onDestroy(destroyMock)
			onUpdate(updateMock)
			onAdoption(adoptionMock)
			
			return element;
		}
		
		const Button = Cube(MyButton, {value: 12});
		
		const {createElement} = Button();
		
		const btn = createElement();
		
		document.body.appendChild(btn);
		
		expect(mountMock).toHaveBeenCalled();
		
		btn.value = 20;
		
		expect(updateMock).toHaveBeenCalledWith("value", 20, 12);
		
		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		
		iframe.contentDocument?.body.appendChild(btn)
		
		expect(adoptionMock).toHaveBeenCalled();
		
		btn.remove()
		
		expect(destroyMock).toHaveBeenCalled();
	});
	
	it('should have updated props object on update', () => {
		const updateMock = jest.fn();
		const CoolButton = (props: any) => {
			const element = document.createElement("button");
			
			onUpdate(() => {
				updateMock(props)
			})
			
			return element;
		}
		
		const Button = Cube(CoolButton, {value: 12});
		
		const {createElement} = Button();
		
		const btn = createElement();
		
		document.body.appendChild(btn);
		
		btn.value = 20;
		
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
		
		const Button = Cube(PureButton, {value: 12});
		
		const {createElement} = Button();
		
		const btn = createElement();
		
		document.body.appendChild(btn);
		
		btn.shadowRoot?.querySelector("button")?.click();
		
		// expect(btn.value).toBe(12)
	});
})
