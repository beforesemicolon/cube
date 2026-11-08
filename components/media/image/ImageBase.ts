import { Component, type ComponentProps } from '../../core/Component.js'
import { scalarText } from '../../core/value.js'

export type ImageLoading = 'eager' | 'lazy'
export type ImageDecoding = 'auto' | 'sync' | 'async'
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
export type ImageVariant = 'image' | 'thumbnail'

export interface ImageProps extends ComponentProps {
    src?: string
    alt?: string
    fallbackSrc?: string
    fallbackIcon?: string
    loading?: ImageLoading
    decoding?: ImageDecoding
    fit?: ImageFit
    position?: string
    variant?: ImageVariant
    width?: string
    height?: string
    aspectRatio?: string
    loadingLabel?: string
    errorLabel?: string
}

/** Native image loading and fallback behavior shared by media and thumbnail uses. */
export abstract class ImageBase<
    P extends ImageProps = ImageProps,
> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'src',
        'alt',
        'fallback-src',
        'fallback-icon',
        'loading',
        'decoding',
        'fit',
        'position',
        'variant',
        'width',
        'height',
        'aspect-ratio',
        'loading-label',
        'error-label',
    ]

    src = ''
    alt = ''
    fallbackSrc = ''
    fallbackIcon = 'image'
    loading: ImageLoading = 'lazy'
    decoding: ImageDecoding = 'async'
    fit: ImageFit = 'cover'
    position = 'center'
    variant: ImageVariant = 'image'
    width = ''
    height = ''
    aspectRatio = ''
    loadingLabel = ''
    errorLabel = ''

    protected source(): string {
        return scalarText(this.src)
    }
}
