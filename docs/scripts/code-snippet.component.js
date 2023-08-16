import '../scripts/highlight/highlight.min.js';
import snippets from './snippets.json' assert { type: 'json' };
const {hljs, BFS} = window;
const {register, template, html, useValue, when} = BFS.Cube;


export const langColor = {
  html: "#00355a",
  css: "#007474",
  javascript: "#ba8800",
}

const CodeSnippet = (props) => {
  const snippet = snippets[props.name()];
  
  if (snippet) {
    const code = hljs.highlight(snippet, {language: props.language()});
    const [copyLabel, setCopyLabel] = useValue('Copy');
    let timer;
    
    const copyToClipboard = async () => {
      clearTimeout(timer);
      
      try {
        await navigator.clipboard.writeText(snippet);
        setCopyLabel("Copied");
      } catch (err) {
        setCopyLabel("Failed");
      }
      
      timer = setTimeout(() => {
        setCopyLabel("Copy");
      }, 1000)
    }
    
    const copyButton = when(
      navigator.clipboard,
      () => html`<button class="btn" type="button" onclick="${copyToClipboard}">${copyLabel}</button>`
    );
    
    const sourceLink = when(
      props.src,
      () => html`<a class="btn link" href="${props.src}" target="_blank">Open</a>`
    );
    
    const langLabel = when(
      () => !props.hideLang(),
      () => html`<span class="lang" style="background: ${color}">${props.language}</span>`
    );
    
    const color = langColor[props.language()] ?? "#222";
    
    const temp = template`
      <div class="actions">
        ${copyButton}
        ${sourceLink}
        ${langLabel}
      </div>
      <pre><code class="language-${props.language} theme-hybrid" ref="code"></code></pre>
    `;
    
    temp.refs['code'].insertAdjacentHTML("afterbegin", code.value)
  }
}

const CodeSnippetStyle = () => {
  return {
    "code-snippet": {
      display: "block",
      background: "#0d0d0d",
      border: "1px solid #222",
      padding: "30px 15px 10px",
      borderRadius: 5,
      position: "relative",
      maxHeight: 450,
      boxSizing: "border-box",
      "*": {
        boxSizing: "border-box"
      },
      ".actions": {
        position: "absolute",
        right: 0,
        top: 0,
        background: "#171717",
        fontSize: 12,
        borderRadius: "0 0 0 5px",
        overflow: "hidden",
        display: "flex",
        color: "#fff",
        ".lang": {
          display: "inline-block",
          padding: "1px 10px"
        },
        '.btn': {
          all: "unset",
          background: "#1c1c1c",
          cursor: "pointer",
          padding: "1px 10px",
        },
        '.link': {
          background: "#005a9c"
        }
      },
      pre: {
        display: "block",
        margin: 0,
        height: "100%",
        overflow: "auto",
        code: {
          display: "block",
          textWrap: "wrap",
          wordBreak: "break-word",
          fontSize: 14,
          lineHeight: "135%"
        }
      }
    }
  }
}

register(CodeSnippet, {
  language: "bash",
  name: "",
  src: "",
  hideLang: false,
},  CodeSnippetStyle, {
  mode: "none"
})
