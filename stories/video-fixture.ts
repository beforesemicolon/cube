/** An original, offline video fixture; no remote media, camera, microphone or autoplay permission. */
export async function demoVideo(seconds=2):Promise<string|null>{
    if(typeof MediaRecorder==='undefined'||!HTMLCanvasElement.prototype.captureStream)return null
    const canvas=document.createElement('canvas');canvas.width=480;canvas.height=270
    const context=canvas.getContext('2d');if(!context)return null
    const stream=canvas.captureStream(12),chunks:BlobPart[]=[]
    const type=['video/webm;codecs=vp8','video/webm','video/mp4'].find(value=>MediaRecorder.isTypeSupported(value));if(!type){stream.getTracks().forEach(t=>t.stop());return null}
    const recorder=new MediaRecorder(stream,{mimeType:type});let frame=0,animation=0
    const draw=()=>{context.fillStyle='#141719';context.fillRect(0,0,480,270);context.fillStyle='#83B6FF';context.beginPath();context.arc(240+Math.sin(frame/12)*90,135,38,0,Math.PI*2);context.fill();frame++;animation=requestAnimationFrame(draw)}
    return new Promise(resolve=>{
        const cleanup=()=>{cancelAnimationFrame(animation);stream.getTracks().forEach(track=>track.stop())}
        recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)}
        recorder.onerror=()=>{cleanup();resolve(null)}
        recorder.onstop=()=>{cleanup();resolve(chunks.length?URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType})):null)}
        draw();recorder.start();setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},Math.max(1,seconds)*1000)
    })
}
export function releaseWhenRemoved(node:HTMLElement,url:string):void{
    const observer=new MutationObserver(()=>{if(!node.isConnected){URL.revokeObjectURL(url);observer.disconnect()}})
    observer.observe(document.documentElement,{childList:true,subtree:true})
}
