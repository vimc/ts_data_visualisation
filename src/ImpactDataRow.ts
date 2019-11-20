/*
The country groups were to be used in the function generateCountryGroup
is Data.ts. See the comment on that function explaining why it is not used.
*/

export interface ImpactDataRow {
    activity_type: string;
    cases_averted: number;
    continent: string;
    country: string;
    country_name: string;
    deaths_averted: number;
    disease: string;
    is_gavi: boolean;
    is_focal: boolean;
    support_type: string;
    touchstone: string;
    vaccine: string;
    year: number;
    [key: string]: any; // this is necessary to allow dynamic access object property using variable
    // https://stackoverflow.com/questions/32968332/
}
/*
export interface ImpactDataRow {
    // these must appear in every dataset
    disease: string;
    year: number;
    deaths: number;
    deaths_averted: number;
    dalys: number;
    dalys_averted: number;
    country: string;
    country_name: string; // can be inferred from country code. Unnecessary?
    // these are optional
    activity_type?: string; // will probably be subsumed into vaccine
    cases?: number;
    cases_averted?: number;
    scenario?: string;
    activity_type?: string;
    continent?: string; // can be inferred from country code. Unnecessary?
    is_gavi?: boolean;
    is_focal?: boolean;
    support_type?: string;
    touchstone?: string;
    vaccine?: string;

    dove94?: boolean; // can be inferred from country code. Unnecessary?
    dove96?: boolean; // can be inferred from country code. Unnecessary?
    gavi68?: boolean; // can be inferred from country code. Unnecessary?
    gavi72?: boolean; // can be inferred from country code. Unnecessary?
    gavi77?: boolean; // can be inferred from country code. Unnecessary?
    pine5?: boolean; // can be inferred from country code. Unnecessary?

    [key: string]: any;
}
*/
