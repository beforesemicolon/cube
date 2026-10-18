export type PopupPlacement = 'bottom-start'|'bottom-end'|'top-start'|'top-end'
/** Top-layer positioning and light-dismiss. No document listeners survive close/dispose. */
export class PopupController {
    private cleanup: Array<()=>void> = []
    private shown = false
    constructor(
        private popup:HTMLElement,
        private anchor:HTMLElement,
        private onDismiss:()=>void,
        private placement:()=>PopupPlacement=()=> 'bottom-start',
        private matchAnchorWidth=false,
    ) {}
    show(point?:{x:number;y:number}):void {
        if(this.shown)return
        this.shown=true;this.popup.hidden=false;this.popup.setAttribute('popover','manual')
        if(typeof this.popup.showPopover==='function'&&!this.popup.matches(':popover-open'))this.popup.showPopover()
        const place=()=>{
            const rect=this.anchor.getBoundingClientRect(),p=this.placement(),view=this.popup.ownerDocument.defaultView??window
            if(this.matchAnchorWidth)this.popup.style.minWidth=`${rect.width}px`
            const bounds=this.popup.getBoundingClientRect(),maxW=view.innerWidth,maxH=view.innerHeight
            let left=point?.x??(p.endsWith('end')?rect.right-bounds.width:rect.left)
            let top=point?.y??(p.startsWith('top')?rect.top-bounds.height-6:rect.bottom+6)
            if(top+bounds.height>maxH-8&&!point)top=rect.top-bounds.height-6
            top=Math.max(8,Math.min(top,maxH-bounds.height-8));left=Math.max(8,Math.min(left,maxW-bounds.width-8))
            Object.assign(this.popup.style,{position:'fixed',inset:'auto',left:`${left}px`,top:`${top}px`,margin:'0',maxWidth:`${maxW-16}px`,maxHeight:`${maxH-16}px`})
        }
        place()
        const doc=this.popup.ownerDocument,view=doc.defaultView??window
        const listen=(target:EventTarget,name:string,fn:EventListener,capture=false)=>{target.addEventListener(name,fn,capture);this.cleanup.push(()=>target.removeEventListener(name,fn,capture))}
        listen(doc,'pointerdown',event=>{const path=event.composedPath();if(!path.includes(this.popup)&&!path.includes(this.anchor))this.onDismiss()},true)
        listen(doc,'keydown',event=>{const e=event as KeyboardEvent;if(e.key==='Escape'){e.preventDefault();this.onDismiss();this.anchor.focus()}},true)
        listen(view,'resize',place);listen(doc,'scroll',place,true)
        if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(place);observer.observe(this.popup);observer.observe(this.anchor);this.cleanup.push(()=>observer.disconnect())}
    }
    hide(restoreFocus=false):void {
        if(!this.shown){this.popup.hidden=true;return}
        this.shown=false;this.cleanup.splice(0).forEach(fn=>fn())
        if(typeof this.popup.hidePopover==='function'&&this.popup.matches(':popover-open'))this.popup.hidePopover()
        this.popup.hidden=true;if(restoreFocus&&this.anchor.isConnected)this.anchor.focus()
    }
    dispose():void { this.hide(false) }
}
