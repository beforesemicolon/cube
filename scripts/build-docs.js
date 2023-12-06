require('global-jsdom/register')

const { parse } = require('@beforesemicolon/html-parser')
const fs = require('fs/promises')
const path = require('path')

const DocumentDirPath = path.resolve(__dirname, '../docs/documentation')
const DocumentHtmlPath = path.join(DocumentDirPath, 'index.html')
const DocumentArticlesDirPath = path.join(DocumentDirPath, 'articles')

const footerNav = ({ prev, next }) => `
<div class="nav-footer">
	<div class="prev">
		${prev ? `<span>Prev:</span> <a href="${prev.href}">${prev.label}</a>` : ''}
	</div>
	<div class="next">
		${next ? `<span>Next:</span> <a href="${next.href}">${next.label}</a>` : ''}
	</div>
</div>
`

const getNavObj = (anchorElement) => {
    if (anchorElement) {
        const href = anchorElement.href
        const fileName =
            (href.replace(/\/documentation\/?/, '') || 'why-cube') + '.html'
        const name = fileName.replace('.html', '')
        const label = name
            .split('-')
            .map((n) => n[0].toUpperCase() + n.slice(1))
            .join(' ')

        return { href, label }
    }

    return null
}

fs.readFile(DocumentHtmlPath, 'utf-8').then(async (content) => {
    const doc = parse(content, document)
    const html = doc.querySelector('html')
    const article = doc.getElementById('doc-content')
    const docMenu = doc.getElementById('doc-menu')
    const navItems = docMenu.querySelectorAll('a')
    let idx = 0

    for (let navItem of navItems) {
        const href = navItem.href
        const fileName =
            (href.replace(/\/documentation\/?/, '') || 'why-cube') + '.html'

        article.innerHTML = await fs.readFile(
            path.join(DocumentArticlesDirPath, fileName),
            'utf-8'
        )

        navItem.closest('li').classList.add('active')

        article.insertAdjacentHTML(
            'beforeend',
            footerNav({
                prev: getNavObj(navItems[idx - 1]),
                next: getNavObj(navItems[idx + 1]),
            })
        )

        const newArticleContent = html.outerHTML

        navItem.parentElement.classList.remove('active')

        await fs.writeFile(
            path.join(DocumentDirPath, fileName),
            newArticleContent
        )

        idx += 1
    }
})
