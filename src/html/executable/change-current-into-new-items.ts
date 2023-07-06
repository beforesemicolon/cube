export const changeCurrentIntoNewItems = (currentItems: Node[], newItems: Node[], endAnchor: Node) => {
	if (currentItems.length && newItems.length) {
		let i = 0;
		let len = Math.max(newItems.length, currentItems.length);
		const newItemsSet = new Set(newItems);
		
		while (i < len) {
			const n = newItems[i];
			const c = currentItems[i];
			
			if (!c && !n) {
				break;
			}
			
			if (n === undefined) {
				delete currentItems[i];
				c.parentNode?.removeChild(c)
				i += 1;
				continue;
			}
			
			if (c === undefined) {
				endAnchor.parentNode?.insertBefore(n, endAnchor);
				currentItems.splice(i, 0, n);
				i += 1;
				continue;
			}
			
			if (newItemsSet.has(c)) {
				if (n !== c) {
					c.parentNode?.insertBefore(n, c);
					c.parentNode?.removeChild(c)
					currentItems.splice(i, 1, n)
				}
				i += 1;
			} else {
				c.parentNode?.removeChild(c);
				currentItems.splice(i, 1)
			}
		}
		
		endAnchor.parentNode?.removeChild(endAnchor);
	}
}
