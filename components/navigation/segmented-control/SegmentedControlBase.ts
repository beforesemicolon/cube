import { ChoiceGroupBase, type ChoiceGroupProps } from '../ChoiceGroupBase.js'

export interface SegmentedControlProps extends ChoiceGroupProps {}

/** Headless single-selection model for a compact group of related views or values. */
export abstract class SegmentedControlBase<P extends SegmentedControlProps = SegmentedControlProps> extends ChoiceGroupBase<P> {}
