export const conditionalField = (key: string, value: unknown) =>
    value === undefined ? {} : { [key]: value }
