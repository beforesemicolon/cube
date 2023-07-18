import {HtmlTemplate} from "@beforesemicolon/html";

export interface StylesheetObject {
	[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}

export type Stylesheet = StylesheetObject | string;
export type Props<P> = Record<keyof P, () => P[keyof P]>
export type FnComponent<P> = (props: Props<P>) => void;
export type ShadowRootMode = "open" | "closed";
export interface CurrentComponent {
	destroy: () => void;
	mount: () => void;
	adoption: () => void;
	beforeUpdate: () => void;
	afterUpdate: () => void;
	dispatchEvent: (e: CustomEvent) => void;
	template: HtmlTemplate | null;
}

export interface ComponentOptions {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
}

export interface CustomEventListener<D> {
	(evt: CustomEvent<D>): void;
}

export interface ElementInterface {
	self: () => HTMLElement;
	isComponent: () => boolean;
	text: (value?: string) => string | null | ElementInterface;
	toHtml: () => string;
	html: (value?: string) => string | ElementInterface | null;
	attr: (name: string, value?: any) => string | null | ElementInterface;
	prop: (name: string, value?: any) => string | null | ElementInterface;
	class: (value?: string) => string | ElementInterface;
	id: (value?: string) => string | ElementInterface;
	style: (property: keyof CSSStyleDeclaration, value: string | null) => string | CSSStyleDeclaration;
	parent: () => ElementInterface | null;
	children: () => ElementInterface[];
	prepend: (node: Node) => ElementInterface;
	append: (node: Node) => ElementInterface;
	replaceWith: (node: HTMLElement) => ElementInterface;
	insertAt: (node: Node, order: number) => ElementInterface;
	find: (selector: string) => ElementInterface[];
	siblings: () => ElementInterface[];
	prev: () => ElementInterface | null;
	next: () => ElementInterface | null;
	on: (eventName: string, handler?: EventListenerOrEventListenerObject | CustomEventListener<unknown>, options?: boolean | AddEventListenerOptions) => ElementInterface;
	off: (eventName: string) => ElementInterface;
}
