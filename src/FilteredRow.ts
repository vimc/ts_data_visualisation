export interface FilteredRow {
    label: string;
    data: number[];
    backgroundColor: string;
    [key: string]: any; // this is necessary to allow dynamic access object property using variable
    // https://stackoverflow.com/questions/32968332/
}
