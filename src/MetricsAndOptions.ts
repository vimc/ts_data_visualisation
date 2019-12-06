export interface MetricsAndOptions {
    mode: "public" | "private"
    // These are the metric columns in the data set e.g. deaths, dalys, cases_averted etc.
    metrics: string[];
    // These are the methods we can toggle between
    methods: string[];
    // These are the columns that we filter the data by and can stratify by
    // e.g. country, year, vaccine
    filterOptions: string[];
    // These are columns that we stratify by but not filter by e.g. continent
    // (we never filter by continent, we filter by country)
    otherOptions?: string[];
    // Other columns that are automatically filtered by but we do not let the
    // user startify by e.g. is_focal == true
    // This should be used be sparingly as a quick fix to get a dataset to work.
    // Usually we filter the data before it gets the the app so this should be empty
    secretOptions?: { [key: string]: any };
}