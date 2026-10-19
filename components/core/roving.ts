/** Roving tabindex with disabled skipping, RTL arrows, Home/End, and typeahead. */
export class RovingFocus {
    private buffer = ''; private typedAt = 0
    constructor(private items:()=>HTMLElement[], private orientation:()=>string=()=> 'horizontal', private selected?:(index:number)=>void) {}
    private target(node:HTMLElement):HTMLElement{return node.hasAttribute('data-semantic-host')?node:node.shadowRoot?.querySelector<HTMLElement>('[part~=control]')??node}
    reset(preferred=0):void { const list=this.items(); const index=list[preferred]?preferred:0;list.forEach((n,i)=>this.target(n).tabIndex=i===index?0:-1) }
    focus(index:number):void { const list=this.items();if(!list[index])return;this.reset(index);this.target(list[index]).focus();this.selected?.(index) }
    keydown(event:KeyboardEvent):void {
        if(event.altKey||event.ctrlKey||event.metaKey)return
        const list=this.items();if(!list.length)return
        const path=event.composedPath();let current=list.findIndex(n=>path.includes(n));if(current<0)current=list.findIndex(n=>this.target(n).tabIndex===0)
        let next=-1;const vertical=this.orientation()==='vertical',rtl=getComputedStyle(list[0]).direction==='rtl'
        if(event.key==='Home')next=0
        else if(event.key==='End')next=list.length-1
        else if(vertical&&event.key==='ArrowDown'||!vertical&&event.key===(rtl?'ArrowLeft':'ArrowRight'))next=(current+1+list.length)%list.length
        else if(vertical&&event.key==='ArrowUp'||!vertical&&event.key===(rtl?'ArrowRight':'ArrowLeft'))next=(current-1+list.length)%list.length
        else if(event.key.length===1&&!/\s/.test(event.key)){
            const now=Date.now();this.buffer=now-this.typedAt>600?'':this.buffer;this.typedAt=now;this.buffer+=event.key.toLocaleLowerCase()
            const query=[...this.buffer].every(c=>c===this.buffer[0])?this.buffer[0]:this.buffer
            for(let offset=1;offset<=list.length;offset++){const i=(current+offset+list.length)%list.length;if((list[i].getAttribute('data-label')??list[i].textContent??'').trim().toLocaleLowerCase().startsWith(query)){next=i;break}}
        }
        if(next>=0){event.preventDefault();this.focus(next)}
    }
}
