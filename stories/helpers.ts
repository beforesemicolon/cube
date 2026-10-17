import '../components/client.js'
export function preview(tag: string, args: Record<string, unknown>, appearance: string) {
    const provider = document.createElement('cb-theme-provider')
    Object.assign(provider, { appearance })
    const wrapper = document.createElement('div'); wrapper.style.maxWidth = '960px'
    const node = document.createElement(tag); Object.assign(node, args); wrapper.append(node); provider.append(wrapper)
    return provider
}
export function silentAudio(seconds = 4): string {
    const samples = Math.round(8000 * seconds), data = new Uint8Array(44 + samples * 2), view = new DataView(data.buffer)
    const write = (at: number, value: string) => [...value].forEach((c, i) => data[at + i] = c.charCodeAt(0))
    write(0, 'RIFF'); view.setUint32(4, data.length-8, true); write(8, 'WAVE'); write(12, 'fmt ')
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true)
    view.setUint32(28,16000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples*2,true)
    let binary=''; for (const byte of data) binary+=String.fromCharCode(byte)
    return `data:audio/wav;base64,${btoa(binary)}`
}
