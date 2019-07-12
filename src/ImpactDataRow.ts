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
//    dove94: boolean;
//    dove96: boolean;
//    gavi68: boolean;
//    gavi72: boolean;
//    gavi77: boolean;
    is_gavi: boolean;
    is_focal: boolean;
//    pine5: boolean;
    rate_type: string; // is this ever used?
    support_type: string;
    touchstone: string;
    vaccine: string;
    year: number;
    [key: string]: any; // this is necessary to allow dynamic access object property using variable
    // https://stackoverflow.com/questions/32968332/
}
