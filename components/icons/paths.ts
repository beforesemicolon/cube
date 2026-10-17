/** Original outline glyphs. Paths are trusted library data, never user-supplied SVG markup. */
export const iconPaths: Record<string,string> = {
 plus:'M12 4v16M4 12h16',minus:'M4 12h16',check:'M4 12l5 5L20 6',close:'M6 6l12 12M18 6L6 18',
 down:'M6 9l6 6 6-6',up:'M6 15l6-6 6 6',left:'M15 6l-6 6 6 6',right:'M9 6l6 6-6 6',
 search:'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
 settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 eyeOff:'M3 3l18 18M10 5h2c6 0 10 7 10 7a20 20 0 0 1-4 4M6 6a20 20 0 0 0-4 6s4 7 10 7h2',
 lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',unlock:'M7 10V7a5 5 0 0 1 9-3M5 10h14v11H5zM12 14v3',
 layers:'M12 3L2 8l10 5 10-5zM2 12l10 5 10-5M2 16l10 5 10-5',component:'M12 2l10 10-10 10L2 12zM12 2v20M2 12h20',
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',text:'M4 4h16M12 4v16M8 20h8',
 image:'M3 3h18v18H3zM3 16l6-7 5 6 3-3 4 5M17 7h.01',upload:'M12 16V3M7 8l5-5 5 5M4 16v5h16v-5',
 arrow:'M4 12h16M14 6l6 6-6 6',external:'M14 3h7v7M21 3L10 14M10 4H4v16h16v-6',
 link:'M10 14l4-4M9 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M15 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
 unlink:'M3 3l18 18M7 14l-2 2a3 3 0 0 0 4 4l2-2M17 10l2-2a3 3 0 0 0-4-4l-2 2',
 undo:'M8 5L3 10l5 5M3 10h10a7 7 0 0 1 7 7v3',redo:'M16 5l5 5-5 5M21 10h-10a7 7 0 0 0-7 7v3',
 more:'M5 12h.01M12 12h.01M19 12h.01',drag:'M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01',
 desktop:'M2 3h20v14H2zM12 17v4M7 21h10',tablet:'M5 2h14v20H5zM11 19h2',mobile:'M7 2h10v20H7zM11 19h2',
 play:'M7 4l14 8-14 8z',pause:'M8 4v16M16 4v16',stop:'M5 5h14v14H5z',code:'M8 6l-6 6 6 6M16 6l6 6-6 6M14 3l-4 18',
 comment:'M3 3h18v14H9l-6 5z',cursor:'M4 2l16 11-8 1-4 7z',pin:'M8 3h8l-1 7 4 4H5l4-4zM12 14v8',reset:'M3 10a9 9 0 1 1 0 5M3 4v6h6',
 calendar:'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 6v6l4 2',
 bolt:'M13 2L4 14h7l-1 8 10-13h-7z',warning:'M12 2l11 20H1zM12 8v6M12 18h.01',info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6M12 7h.01',
 folder:'M2 5h8l2 3h10v13H2z',file:'M5 2h9l5 5v15H5zM14 2v6h5',globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',
 copy:'M8 8h13v13H8zM16 8V3H3v13h5',bold:'M6 3h7a5 5 0 0 1 0 10H6zM6 13h8a4 4 0 0 1 0 8H6z',italic:'M10 3h10M4 21h10M15 3L9 21',
 alignLeft:'M3 4h18M3 9h12M3 14h18M3 19h12',alignCenter:'M3 4h18M6 9h12M3 14h18M6 19h12',alignRight:'M3 4h18M9 9h12M3 14h18M9 19h12',
 spark:'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
}
export function createIcon(name: string, part = 'icon'): SVGSVGElement {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('part',part);svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false')
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('part','path');path.setAttribute('d',iconPaths[name]??'');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.5');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg
}
