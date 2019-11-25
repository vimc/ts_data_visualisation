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

export interface MetricsAndOptions {
    // These are the metric columns in the data set e.g. deaths, dalys, cases_averted etc.
    metrics: string[];
    // These are the columns that we filter the data by and can stratify by
    // e.g. country, year, vaccine
    filterOptions: string[];
    // These are columns that we stratify by but not filter by e.g. continent
    // (we never filter by continent, we filter by country)
    otherOptions: string[];
    // Other columns that are automatically filtered by but we do not let the
    // user startify by e.g. is_focal == true
    // This should be used be sparingly as a quick fix to get a dataset to work.
    // Usually we filter the data before it gets the the app so this should be empty
    secretOptions?: { [key: string]: any };
}
