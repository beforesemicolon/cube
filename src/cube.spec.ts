import {Cube, onAdoption, onDestroy, onMount, onUpdate, template} from "./cube";

describe('cube', () => {
	it('should handle lifecycles', () => {
		const mountMock = jest.fn();
		const destroyMock = jest.fn();
		const updateMock = jest.fn();
		const adoptionMock = jest.fn();
		
		const MyButton = () => {
			template`<button></button>`
			
			onMount(mountMock)
			onDestroy(destroyMock)
			onUpdate(updateMock)
			onAdoption(adoptionMock)
		}
		
		const Button = Cube(MyButton, {value: 12});
		
		const btn = Button().createElement();
		
		document.body.appendChild(btn.self());
		
		expect(mountMock).toHaveBeenCalled();
		
		btn.attr("value", 20);
		
		expect(updateMock).toHaveBeenCalledWith("value", 20, 12);
		
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
			
			onUpdate(() => {
				updateMock(props)
			})
			
			return element;
		}
		
		const Button = Cube(CoolButton, {value: 12});
		
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
		
		const Button = Cube(PureButton, {value: 12});
		
		const btn = Button().createElement();
		
		document.body.appendChild(btn.self());
		
		btn.find("button")[0].self().click();
		
		// expect(btn.value).toBe(12)
	});
})
