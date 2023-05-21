import {Cube} from "../cube";
import {updateElementKey} from "../update-element-key";

export interface ButtonProps {
	disabled: boolean;
	type: 'submit' | 'button';
}

export const Button = Cube<ButtonProps>("cube-button", {disabled: false, type: "button"}, (props, self ) => {
	const element = document.createElement('button');
	element.innerHTML = "<slot></slot>";
	
	updateElementKey(element, "disabled", props.disabled);
	updateElementKey(element, "type", props.type);
	
	self.onUpdate((name: string, newValue) => {
		updateElementKey(element, name, newValue);
	})
	
	return [element, {
		button: {
			all: "unset",
			padding: "8px 20px",
			borderRadius: "3px",
			textTransform: "capitalize",
			letterSpacing: "0.05px"
		}
	}];
});
