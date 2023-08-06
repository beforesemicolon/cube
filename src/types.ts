import {HtmlTemplate, repeat, html, when, element} from "@beforesemicolon/html";
import {eventDispatch, host, onAdoption, onDestroy, onMount, register, template, useValue} from "./cube";

export interface StylesheetObject {
	[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}

export type Stylesheet = StylesheetObject | string;
export type Props<P> = {
	[K in keyof P]: () => P[K];
}
export type FnComponent<P> = (props: Props<P>) => void;
export type ShadowRootMode = "open" | "closed";
export interface CurrentComponent {
	destroy: () => void;
	mount: () => void;
	adoption: () => void;
	dispatchEvent: (e: CustomEvent) => void;
	template: HtmlTemplate | null;
	self: HTMLElement;
}

export interface ComponentOptions {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
}

export interface Cube {
	register: typeof register;
	onMount: typeof onMount;
	onDestroy: typeof onDestroy;
	onAdoption: typeof onAdoption;
	eventDispatch: typeof eventDispatch;
	useValue: typeof useValue;
	template: typeof template;
	host: typeof host;
	repeat: typeof repeat;
	when: typeof when;
	html: typeof html;
	element: typeof element;
}
