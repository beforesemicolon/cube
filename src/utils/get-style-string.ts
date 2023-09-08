import {replaceCssHost} from "./replace-css-host";

export function getStyleString(stylesheet: string, tagName: string, hasShadowRoot: boolean = true) {
	stylesheet = stylesheet.trim().replace(/\s{2,}/g, ' ');
	
	if (!stylesheet) {
		return '';
	}
	
	const div = document.createElement('div');
	
	div.innerHTML = stylesheet;
	const styleTag = document.createElement('style');
	const links: HTMLLinkElement[] = []
	
	Array.from(div.childNodes).forEach(child => {
		if (child.nodeName === 'LINK' && ((child as HTMLLinkElement).getAttribute('rel') || '').trim() === 'stylesheet') {
			(child as HTMLLinkElement).classList.add(tagName);
			links.push(child as HTMLLinkElement);
		} else if (child.nodeName === '#text') {
			if (!hasShadowRoot) {
				(child as Text).nodeValue = replaceCssHost((child as Text).nodeValue ?? '', tagName).trim();
			}
			styleTag.appendChild(child);
		} else if (child.nodeName === 'STYLE') {
			if ((child as HTMLStyleElement).id) {
				styleTag.id = (child as HTMLStyleElement).id;
			}
			(child as HTMLStyleElement).classList.forEach(cls => {
				styleTag.classList.add(cls);
			})
			
			if (!hasShadowRoot) {
				(child as Text).textContent = replaceCssHost((child as Text).textContent ?? '', tagName).trim();
			}
			
			
			styleTag.insertAdjacentText('beforeend', (child as Text).textContent ?? '');
		}
	});
	
	styleTag.classList.add(tagName);
	
	return links.map(el => el.outerHTML).join('') + ((styleTag.textContent ?? '').trim().length ? styleTag.outerHTML : '');
}
