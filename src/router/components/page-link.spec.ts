import {Cube} from "../../types";
import * as cube from '../../cube';
import initPageLink from './page-link';
import {render} from "../../testing";
import {html, state} from "@beforesemicolon/web-component";

initPageLink({...cube, state} as unknown as Cube)

describe('PageLink', () => {
	it('should render correctly', async () => {
		const l1ActiveMock = jest.fn();
		const l2ActiveMock = jest.fn();
		
		const cont = await render(html`
			<page-link path="/" onactive="${l1ActiveMock}"></page-link>
			<page-link path="/test" onactive="${l2ActiveMock}"></page-link>
		`)
		
		const [l1, l2] = cont.find('page-link');
		
		expect(l1.content).toBe('<a part="anchor active" href="/">\n' +
			'\t\t\t\t<slot></slot>\n' +
			'\t\t\t</a>')
		expect(l2.content).toBe('<a part="anchor" href="/test">\n' +
			'\t\t\t\t<slot></slot>\n' +
			'\t\t\t</a>')
		
		l2.find('a')[0]?.target?.click()
		
		expect(l2ActiveMock).toHaveBeenCalledTimes(2)
		expect(l1ActiveMock).toHaveBeenCalledTimes(2)
		
		expect(l1.content).toBe('<a part="anchor" href="/">\n' +
			'\t\t\t\t<slot></slot>\n' +
			'\t\t\t</a>')
		expect(l2.content).toBe('<a part="anchor active" href="/test">\n' +
			'\t\t\t\t<slot></slot>\n' +
			'\t\t\t</a>')
	});
})
