import {HtmlTemplate, repeat, html, when, element} from "@beforesemicolon/html";
import {eventDispatch, host, onAdoption, onDestroy, onMount, register, template, useValue, createContext, useContext} from "./cube";

export interface StylesheetObject {
	[k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}

export type Stylesheet = StylesheetObject | string;
export type Style<P> = (data: Props<P>) => Stylesheet;
export type Props<P> = {
	[K in keyof P]: () => P[K];
}
export type FnComponent<P> = (props: Props<P>) => void;
export enum ShadowRootMode {
	OPEN = "open",
	CLOSED = "closed",
	NONE = "none"
}

export interface PathOptions {
	title?: string;
	state?: Record<string, unknown>;
	search?: Record<string, string>;
}

export interface Page {
	path: string,
	options: PathOptions
}

export interface ComponentOptions {
	mode?: ShadowRootMode;
	delegatesFocus?: boolean;
}

export interface ContextModel<T> {
	readonly: boolean;
	getData: () => T;
	setData: (data: T) => void;
	subs: Set<(name: string, newValue: unknown, oldValue: unknown) => void>
}

export type Context<T> = Record<string, ContextModel<T>>;

export interface CurrentComponent {
	destroy: (() => void) | null;
	mount: (() => void | (() => void)) | null;
	adoption: (() => void) | null;
	update: ((propName: string, newValue: unknown, oldValue: unknown) => void) | null;
	contextUpdate: (propName: string, newValue: unknown, oldValue: unknown) => void;
	dispatchEvent: (e: CustomEvent) => void;
	contextMap: Map<string, {reactive: boolean; inContext: boolean; ctx: ContextModel<unknown> | null}>;
	template: HtmlTemplate | null;
	self: HTMLElement;
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
	createContext: typeof createContext;
	useContext: typeof useContext;
}
