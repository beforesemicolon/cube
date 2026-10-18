import { ChoiceGroupBase, type ChoiceGroupProps } from '../ChoiceGroupBase.js'

export interface TabsProps extends ChoiceGroupProps { activation?: 'automatic' | 'manual' }

/** Headless tab selection and activation policy. */
export abstract class TabsBase<P extends TabsProps = TabsProps> extends ChoiceGroupBase<P> {
    static observedAttributes = [...ChoiceGroupBase.observedAttributes, 'activation']
    activation: TabsProps['activation'] = 'automatic'
}
