import {changeCurrentIntoNewItems} from "./change-current-into-new-items";

describe("changeCurrentIntoNewItems", () => {
	const ul = document.createElement("ul");
	
	const nodes = Array.from({length: 10}, (_, i) => {
		const li = document.createElement('li');
		li.textContent = `item ${i + 1}`;
		
		return li;
	});
	
	beforeEach(() => {
		ul.innerHTML = '';
	})
	
	it('should add all new items', () => {
		changeCurrentIntoNewItems([], nodes, ul);
		
		expect(ul.children).toHaveLength(nodes.length)
	});
	
	it('should remove all new items', () => {
		nodes.forEach(n => ul.appendChild(n));
		
		expect(ul.children).toHaveLength(nodes.length);
		
		changeCurrentIntoNewItems(Array.from(ul.childNodes), [], ul);
		
		expect(ul.children).toHaveLength(0);
	});
	
	it('should remove items from the start', () => {
		nodes.forEach(n => ul.appendChild(n));
		
		expect(ul.children).toHaveLength(nodes.length);
		
		changeCurrentIntoNewItems(Array.from(ul.childNodes), nodes.slice(2), ul);
		
		expect(ul.children).toHaveLength(8);
		expect(ul.children[0].textContent).toBe("item 3");
	});
	
	it('should remove items from the middle', () => {
		nodes.forEach(n => ul.appendChild(n));
		
		expect(ul.children).toHaveLength(nodes.length);
		const startNodes = nodes.slice(0, 3);
		const endNodes = nodes.slice(7);
		
		expect([...startNodes, ...endNodes].map(n => n.textContent)).toEqual([
			"item 1",
			"item 2",
			"item 3",
			"item 8",
			"item 9",
			"item 10"
		])
		expect(Array.from(ul.children, n => n.textContent)).toEqual([
			"item 1",
			"item 2",
			"item 3",
			"item 4",
			"item 5",
			"item 6",
			"item 7",
			"item 8",
			"item 9",
			"item 10"
		]);
		
		changeCurrentIntoNewItems(Array.from(ul.childNodes), [...startNodes, ...endNodes], ul);
		
		expect(ul.children).toHaveLength(6);
		expect(ul.children[0].textContent).toBe("item 1");
		expect(ul.children[ul.children.length - 1].textContent).toBe("item 10");
		expect(Array.from(ul.children, n => n.textContent)).toEqual([
			"item 1",
			"item 2",
			"item 3",
			"item 8",
			"item 9",
			"item 10"
		]);
	});
	
	it('should remove items from the end', () => {
		nodes.forEach(n => ul.appendChild(n));
		
		expect(ul.children).toHaveLength(nodes.length);
		
		changeCurrentIntoNewItems(Array.from(ul.childNodes), nodes.slice(0, -2), ul);
		
		expect(ul.children).toHaveLength(8);
		expect(ul.children[0].textContent).toBe("item 1");
		expect(ul.children[ul.children.length - 1].textContent).toBe("item 8");
	});
	
	it("should reverse the items", () => {
		nodes.forEach(n => ul.appendChild(n));
		
		const reversedNodes: Node[] = [];
		
		nodes.forEach((n, i, list) => {
			reversedNodes.unshift(n);
		})
		
		expect(Array.from(ul.children, n => n.textContent)).toEqual([
			"item 1",
			"item 2",
			"item 3",
			"item 4",
			"item 5",
			"item 6",
			"item 7",
			"item 8",
			"item 9",
			"item 10"
		]);
		
		expect(reversedNodes.map(n => n.textContent)).toEqual([
			"item 10",
			"item 9",
			"item 8",
			"item 7",
			"item 6",
			"item 5",
			"item 4",
			"item 3",
			"item 2",
			"item 1"
		])
		
		changeCurrentIntoNewItems(Array.from(ul.childNodes), reversedNodes, ul);
		
		expect(Array.from(ul.children, n => n.textContent)).toEqual([
			"item 10",
			"item 9",
			"item 8",
			"item 7",
			"item 6",
			"item 5",
			"item 4",
			"item 3",
			"item 2",
			"item 1"
		]);
	})
	
	it('should shuffle items', () => {
		nodes.forEach(n => ul.appendChild(n));
		
		const shuffledNodes = [
			nodes[8],
			nodes[2],
			nodes[3],
			nodes[1],
			nodes[9],
			nodes[0],
			nodes[5],
		];
		
		expect(Array.from(ul.children, n => n.textContent)).toEqual([
			"item 1",
			"item 2",
			"item 3",
			"item 4",
			"item 5",
			"item 6",
			"item 7",
			"item 8",
			"item 9",
			"item 10"
		]);
		
		expect(shuffledNodes.map(n => n.textContent)).toEqual([
			"item 9",
			"item 3",
			"item 4",
			"item 2",
			"item 10",
			"item 1",
			"item 6"
		])
		
		changeCurrentIntoNewItems(Array.from(ul.childNodes), shuffledNodes, ul);
		
		expect(Array.from(ul.children, n => n.textContent)).toEqual([
			"item 9",
			"item 3",
			"item 4",
			"item 2",
			"item 10",
			"item 1",
			"item 6"
		]);
	});
})
