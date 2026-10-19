import { register } from '../core/Component.js'
import { Presence } from './presence/index.js'
import { RemoteCursor } from './remote-cursor/index.js'
import { CommentPin } from './comment-pin/index.js'
import { CommentThread } from './comment-thread/index.js'
export * from './presence/index.js'
export * from './remote-cursor/index.js'
export * from './comment-pin/index.js'
export * from './comment-thread/index.js'

export function registerCollaboration(): void {
    register('cb-presence', Presence)
    register('cb-remote-cursor', RemoteCursor)
    register('cb-comment-pin', CommentPin)
    register('cb-comment-thread', CommentThread)
}
