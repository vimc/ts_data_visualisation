export interface FilteredRow {
    label: string,
    data: number[],
    backgroundColor: string
    [key: string]: any; // this is necessary to allow dynamic access object property using variable
    // https://stackoverflow.com/questions/32968332/how-do-i-prevent-the-error-index-signature-of-object-type-implicitly-has-an-an
}