export interface ImpactDataRow {
    activity_type: string;
    cases_averted: number;
    continent: string;
    country: string;
    countryName: string;
    deaths_averted: number;
    disease: string;
    isGavi: boolean;
    is_focal: boolean;
    rate_type: string; // is this ever used?
    support_type: string;
    touchstone: string;
    vaccine: string;
    year: number;
    [key: string]: any; // this is necessary to allow dynamic access object property using variable
    // https://stackoverflow.com/questions/32968332/
}
