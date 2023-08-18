const jsdom = require("jsdom");
const {JSDOM} = jsdom;
global.document = new JSDOM('').window.document;

const {parse} = require('@beforesemicolon/html-parser');
const fs = require('fs/promises');
const path = require('path');

const DocumentDirPath = path.resolve(__dirname, '../docs/documentation');
const DocumentHtmlPath = path.join(DocumentDirPath, 'index.html');
const DocumentArticlesDirPath = path.join(DocumentDirPath, 'articles');

fs.readFile(DocumentHtmlPath, 'utf-8')
	.then(async content => {
		const doc = parse(content);
		const html = doc.querySelector('html');
		const article = doc.getElementById('doc-content');
		const activeNavItem = doc.querySelector('#doc-menu li.active');
		
		const articlesFileNames = await fs.readdir(DocumentArticlesDirPath);
		
		for (const name of articlesFileNames) {
			article.innerHTML = await fs.readFile(path.join(DocumentArticlesDirPath, name), 'utf-8');
			const corespondentAnchor = doc.querySelector(`#doc-menu a[href="/documentation/${name.replace(".html", '')}"]`)
			
			if (corespondentAnchor) {
				activeNavItem.classList.remove("active");
				corespondentAnchor.parentElement.classList.add('active');
			} else {
				console.log(`No nav link for "${name}"`);
			}
			
			const newArticleContent = html.outerHTML;
			
			if (corespondentAnchor) {
				activeNavItem.classList.add("active");
				corespondentAnchor.parentElement.classList.remove('active');
			}
			
			try {
				await fs.unlink(path.join(DocumentDirPath, name))
			} catch(e) {
			}
			
			await fs.writeFile(path.join(DocumentDirPath, name), newArticleContent)
		}
	})
