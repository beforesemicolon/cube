import { register } from '../core/Component.js'
import { Flashbar } from './flashbar/index.js'
import { Status } from './status/index.js'
import { EmptyState } from './empty-state/index.js'
import { Skeleton } from './skeleton/index.js'
import { Progress } from './progress/index.js'
import { Spinner } from './spinner/index.js'
import { Toast } from './toast/index.js'
import { Alert } from './alert/index.js'
import { Banner } from './banner/index.js'
export * from './flashbar/index.js'
export * from './MessageBase.js'
export * from './ProgressIndicatorBase.js'
export * from './status/index.js'
export * from './empty-state/index.js'
export * from './skeleton/index.js'
export * from './progress/index.js'
export * from './spinner/index.js'
export * from './toast/index.js'
export * from './alert/index.js'
export * from './banner/index.js'

export function registerFeedback(): void {
    register('cb-flashbar', Flashbar)
    register('cb-status', Status)
    register('cb-empty-state', EmptyState)
    register('cb-skeleton', Skeleton)
    register('cb-progress', Progress)
    register('cb-spinner', Spinner)
    register('cb-toast', Toast)
    register('cb-alert', Alert)
    register('cb-banner', Banner)
}
