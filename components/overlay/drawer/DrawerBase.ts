import { ModalBase, type ModalProps } from '../modal/ModalBase.js'

export interface DrawerProps extends ModalProps { placement?: 'start' | 'end' }

/** Side-sheet dialog behavior without prescribing drawer rendering. */
export abstract class DrawerBase<P extends DrawerProps = DrawerProps> extends ModalBase<P> {
    static observedAttributes = [...ModalBase.observedAttributes, 'placement']
    placement: 'start' | 'end' = 'end'
}
