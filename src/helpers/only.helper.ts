import {HTMLRenderTemplate} from "../cube";

export const Only = (condition: boolean | (() => boolean), temp: HTMLRenderTemplate) => {
	return () => {
		const shouldRender = typeof condition === "boolean" ? condition : condition();

		if (shouldRender) {
			return temp;
		}
		
		return ""
	}
};

