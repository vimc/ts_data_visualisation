export interface MetricsAndOptions {
  // Is this for the private or public tool
  mode: "public" | "private";
  // These are the metric columns in the data set e.g. deaths, dalys, cases_averted etc.
  metrics: string[];
  // These are the methods we can toggle between e.g. deaths, daly, FVPs, etc.
  methods: string[];
  // These are the columns that we filter the data by and can stratify by
  // e.g. country, year, vaccine
  dualOptions: string[];
  // These are columns that we stratify by but not filter by e.g. continent
  // (we never filter by continent, we filter by country)
  stratOptions: string[];
  // Theres are columns that we want to be able to filter by but not stratifiy
  // by. Usually these are binary thing like under 5 / all ages, you would never
  // want to compare these values
  filterOptions: string[];
  // These are thing that might want to be show/hide in the UI for different
  // versions (e.g. uncertainity)
  uiVisible: string[];
  // WARNING HORRIBLE HACKY CODE - REMOVE THIS EVENTUALLY
  // Other columns that are automatically filtered by but we do not let the
  // user startify by e.g. is_focal == true
  // This should be used be sparingly as a quick hack to get a dataset to work.
  // Usually we filter the data before it gets the the app so this should be empty
  secretOptions?: { [key: string]: any };
}
