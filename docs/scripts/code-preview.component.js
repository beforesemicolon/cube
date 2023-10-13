import {langColor} from './code-snippet.component.js';
import snippets from './snippets.json' assert { type: 'json' };
const {register, template, html, state, repeat} = window.BFS?.Cube;

const optGapPattern = /[\s,]+(?=[^,\s]+)/

const CodePreview = (props) => {
  const snippet = snippets[props.preview()];
  const languages = () => [...props.lang().split(optGapPattern).map(s => s.trim()), "preview"];
  const names = () => props.name().split(optGapPattern).map(s => s.trim());
  const [currentTab, setCurrentTab] = state(languages()[0]);
  
  const tab = (language) => html`
    <div class="tab ${language}"
         attr.class.active="${() => currentTab() === language}"
         style="background: ${langColor[language] ?? "#222"}"
         onclick="${() => setCurrentTab(language)}">
      ${language}
    </div>`;
  
  const code = (language, index) => language === 'preview' ? '' : html`
	  <code-snippet
		  style="width: ${props.width()}"
		  attr.class.active="${() => currentTab() === language}"
		  language="${language}"
		  name="${names()[index]}"
		  src="${props.src}"
		  hide-lang="true"></code-snippet>
  `;

  template`
    <div class="tabs">
      ${repeat(languages, tab)}
    </div>
    <div class="code-preview">
      ${repeat(languages, code)}
      <div class="preview">
        ${html([snippet])}
      </div>
    </div>
  `;
}

const CodePreviewStyle = () => {
  return `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      border-radius: 3px;
      overflow: hidden;
      height: 500px;
    }
    
    :host, :host * {
     box-sizing: border-box;
    }
    
    :host .tabs {
      display: flex;
      gap: 5px;
      padding: 0 5px;
    }
    
    :host .tabs .tab {
      cursor: pointer;
      padding: 1px 12px 3px;
      background: #333;
      border-radius: 3px 3px 0 0;
      text-transform: capitalize;
      font-size: 14px;
      opacity: 0.7;
      font-weight: 700;
      color: #fff;
    }
    
    :host .tabs .tab.active {
      opacity: 1;
    }
    
    :host .tabs .tab.preview {
      display: none;
    }
    
    :host .code-preview {
      display: flex;
      overflow: hidden;
      border-radius: 5px;
      height: 100%;
      border: 1px solid #222;
    }
    
    :host .code-preview code-snippet {
      display: none;
      min-height: 100%;
      border: none;
      border-radius: 3px 0 0 3px;
    }
    
    :host .code-preview code-snippet.active {
      display: block;
    }
    
    :host .code-preview .preview {
      background: #fff;
      flex: 1;
    }
    
    @media screen and (max-width: 650px) {
      :host .tabs .tab.preview {
        display: inline-block;
      }
      
      :host code-snippet.active ~ .preview {
        display: none;
      }
      
      :host code-snippet,
      :host .code-preview .preview {
        width: 100% !important;
      }
    }
  </style>
  `
}

register(CodePreview, {
  preview: '',
  name: '',
  lang: '',
  src: '',
  width: '70%'
},  CodePreviewStyle, {
  mode: "none"
})
