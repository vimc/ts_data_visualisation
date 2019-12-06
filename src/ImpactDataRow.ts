/*
The country groups were to be used in the function generateCountryGroup
is Data.ts. See the comment on that function explaining why it is not used.
*/

export interface ImpactDataRow {
    // these must appear in every dataset
    disease: string;
    year: number;
    deaths?: number;
    deaths_averted: number;
    dalys?: number;
    dalys_averted: number;
    country: string;
    country_name: string; // can be inferred from country code. Unnecessary?
    // these are optional
    activity_type?: string; // will probably be subsumed into vaccine
    cases?: number;
    cases_averted?: number;
    coverage?: number;
    scenario?: string;
    continent?: string; // can be inferred from country code. Unnecessary?
    is_gavi?: boolean;
    is_focal?: boolean;
    support_type?: string;
    target_population?: number; // this is needed when calculating rates accross multiple variables
    touchstone?: string;
    vaccine?: string;

    [key: string]: any; // other key: value combinations that aren't above
}
