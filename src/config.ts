import {Config, ShadowRootMode} from "./types";

const defaultOptions: Config = {
	mode: ShadowRootMode.OPEN,
	delegatesFocus: false,
	lang: 'en',
	onError: console.error
}

export function updateConfig(opt: Partial<Config> = defaultOptions) {
	for (let optKey in opt) {
		switch (optKey) {
			case "mode":
				defaultOptions.mode = opt.mode && [ShadowRootMode.OPEN, ShadowRootMode.CLOSED, ShadowRootMode.NONE].includes(opt.mode)
					? opt.mode
					: ShadowRootMode.OPEN;
				break;
			case "delegatesFocus":
				defaultOptions.delegatesFocus = typeof opt.delegatesFocus === "boolean" ? opt.delegatesFocus : false;
				break;
			case "lang":
				defaultOptions.lang = String(opt.lang);
				break;
			case "onError":
				defaultOptions.onError = typeof opt.onError === "function" ? opt.onError : console.error;
				break;
		}
	}
}

export const config = {
	get mode() {
		return defaultOptions.mode
	},
	get delegatesFocus() {
		return defaultOptions.delegatesFocus
	},
	get lang() {
		return defaultOptions.lang
	},
	get onError() {
		return defaultOptions.onError
	}
}
