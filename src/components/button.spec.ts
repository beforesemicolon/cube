import {Button, ButtonProps} from "./button";
import {CubeComponent} from "../cube";

describe("Button", () => {
	beforeAll(() => {
		Button();
	})
	
	it('should register', () => {
		expect(customElements.get('cube-button')).not.toBeNull();
	});
	
	it('should render', () => {
		const btn1 = document.createElement("cube-button") as CubeComponent<ButtonProps>;
		btn1.innerHTML = "click me"
		const btn2 = document.createElement("cube-button") as CubeComponent<ButtonProps>;
		btn2.innerHTML = "click me instead";
		
		btn2.disabled = true;
		
		document.body.appendChild(btn1);
		document.body.appendChild(btn2);
		
		expect(document.body.innerHTML).toBe('<cube-button>click me</cube-button><cube-button>click me instead</cube-button>')
		expect(btn1.shadowRoot?.innerHTML).toBe('<style class="cube-button">button {all: unset;padding: 8px 20px;border-radius: 3px;text-transform: capitalize;letter-spacing: 0.05px;}</style><button type="button"><slot></slot></button>')
		expect(btn2.shadowRoot?.innerHTML).toBe('<style class="cube-button">button {all: unset;padding: 8px 20px;border-radius: 3px;text-transform: capitalize;letter-spacing: 0.05px;}</style><button disabled="" type="button"><slot></slot></button>')
	});
})
