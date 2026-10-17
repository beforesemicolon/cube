import { clamp, finite, record, text, bool } from '../core/value.js'
export interface RangeOptions { min?:number; max?:number; step?:number|'any'; value?:number }
export function normalizeRange(input:RangeOptions) {
    const min=finite(input.min,0),max=Math.max(min,finite(input.max,100))
    const step=input.step==='any'?'any':Math.max(Number.EPSILON,finite(input.step,1)>0?finite(input.step,1):1)
    let value=clamp(finite(input.value,min),min,max)
    if(step!=='any')value=clamp(Number((min+Math.round((value-min)/step)*step).toPrecision(14)),min,max)
    return {min,max,step,value,percent:max===min?0:(value-min)/(max-min)*100}
}
export interface SelectOption { value?:string; label?:string; disabled?:boolean; group?:string }
export function normalizeOptions(input:unknown):Array<Required<SelectOption>> {
    if(!Array.isArray(input))return []
    const seen=new Set<string>()
    return input.flatMap(raw=>{
        if(typeof raw!=='string'&&(raw===null||typeof raw!=='object'||Array.isArray(raw)))return []
        const item=typeof raw==='string'?{value:raw,label:raw}:record(raw)
        if(!Object.hasOwn(item,'value')&&!text(item.label))return []
        const value=text(item.value,text(item.label)),label=text(item.label,value)
        if(seen.has(value))return [];seen.add(value)
        return [{value,label,disabled:bool(item.disabled),group:text(item.group)}]
    })
}
