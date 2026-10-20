import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MediaController, seekTarget, clock, type MediaPort } from '../components/media/controller.js'
import { mediaURL } from '../components/core/value.js'
class FakeMedia extends EventTarget implements MediaPort {
    currentTime=0;duration=100;paused=true;ended=false;readyState=1;volume=1;muted=false;playbackRate=1;error=null
    ranges:Array<[number,number]>=[]
    seekable: MediaPort['seekable']
    constructor(){super();const that=this;this.seekable={get length(){return that.ranges.length},start:i=>that.ranges[i][0],end:i=>that.ranges[i][1]}}
    async play(){this.paused=false;this.dispatchEvent(new Event('play'))}
    pause(){this.paused=true;this.dispatchEvent(new Event('pause'))}
}
test('seek clamps finite media and respects disjoint/live ranges',()=>{
    const m=new FakeMedia();assert.equal(seekTarget(m,-5),0);assert.equal(seekTarget(m,200),100)
    m.duration=Infinity;m.ranges=[[10,20],[40,60]]
    assert.equal(seekTarget(m,27),20);assert.equal(seekTarget(m,35),40);assert.equal(seekTarget(m,999),60)
    assert.equal(seekTarget(m,NaN),null)
})
test('unknown duration without ranges cannot seek',()=>{
    const m=new FakeMedia();m.duration=NaN;m.readyState=0;assert.equal(seekTarget(m,10),null)
})
test('transport, volume and rate operations use native media state',async()=>{
    const m=new FakeMedia(), c=new MediaController(m,()=>{},error=>{throw error})
    assert.equal(await c.play(),true);assert.equal(m.paused,false)
    c.seekBy(10);assert.equal(m.currentTime,10);c.setVolume(4);assert.equal(m.volume,1)
    c.setRate(9);assert.equal(m.playbackRate,4);c.stop();assert.equal(m.currentTime,0);assert.equal(m.paused,true);c.dispose()
})
test('stop on live content returns to the earliest available time',()=>{
    const m=new FakeMedia();m.duration=Infinity;m.currentTime=90;m.ranges=[[40,100]]
    const c=new MediaController(m,()=>{},()=>{});c.stop();assert.equal(m.currentTime,40);c.dispose()
})
test('play rejection becomes a recoverable error, never an unhandled rejection',async()=>{
    const m=new FakeMedia(),errors:unknown[]=[];m.play=async()=>{throw new Error('NotAllowedError')}
    const c=new MediaController(m,()=>{},error=>errors.push(error))
    assert.equal(await c.play(),false);assert.equal(errors.length,1);c.dispose()
})
test('stale play errors after replacement and disposal are ignored',async()=>{
    const m=new FakeMedia(),errors:unknown[]=[];let reject!:(e:Error)=>void
    m.play=()=>new Promise((_resolve,no)=>{reject=no})
    const c=new MediaController(m,()=>{},e=>errors.push(e)),pending=c.play();c.cancelPending();reject(new Error('stale'))
    await pending;assert.equal(errors.length,0)
    let count=0;const d=new MediaController(m,()=>count++,()=>{});d.dispose();m.dispatchEvent(new Event('timeupdate'));assert.equal(count,0);c.dispose()
})
test('URLs reject executable schemes while clocks handle unknown and long durations',()=>{
    assert.throws(()=>mediaURL('javascript:alert(1)','https://example.com'))
    assert.equal(mediaURL('/song.mp3','https://example.com'),'https://example.com/song.mp3')
    assert.equal(clock(3661),'1:01:01');assert.equal(clock(NaN),'0:00')
})

test('disposed controllers cannot mutate media through transport settings', () => {
    const media = new FakeMedia(), c = new MediaController(media, () => {}, () => {})
    c.dispose(); const volume = media.volume, muted = media.muted, rate = media.playbackRate, position = media.currentTime
    c.setVolume(.1); c.setMuted(!muted); c.setRate(3); c.seek(2); c.pause()
    assert.equal(media.volume, volume); assert.equal(media.muted, muted); assert.equal(media.playbackRate, rate); assert.equal(media.currentTime, position)
})
