import { ModalBase, type ModalProps } from '../modal/ModalBase.js'

export interface BottomSheetProps extends ModalProps {}

/** Bottom-anchored dialog behavior without prescribing sheet content. */
export abstract class BottomSheetBase<P extends BottomSheetProps = BottomSheetProps> extends ModalBase<P> {}
