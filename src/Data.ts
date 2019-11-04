import {ImpactDataRow} from "./ImpactDataRow";
import {loadObjectFromJSONFile} from "./Utils";

export const countries: string[] =
    loadObjectFromJSONFile("./countryCodes.json");
export const touchstones: string[] =
    loadObjectFromJSONFile("./touchstones.json");
export const supportTypes: string[] =
    loadObjectFromJSONFile("./support.json");
export const activityTypes: string[] =
    loadObjectFromJSONFile("./activities.json");

export const disVac = loadObjectFromJSONFile("./diseaseVaccines.json");
export const diseases: string[] = [];
export const vaccines: string[] = [];
for (const k in disVac) {
    diseases.push(k);
    vaccines.concat(disVac[k]);
}

export const dates: {[code: string]: number[]} =
    loadObjectFromJSONFile("./dates.json");

/*
This function is not used - the idea was to generate country groups (e.g. pine5)
from the dataset rather than reading them from a file. However we use the
country group before we fully load the data set and we can get into a mess.

Se also the commented out line in ImpactDataRow

There probably is a way to do this, but I'm not sure what it is yet.

function generateCountryGroup(impactData: ImpactDataRow[],
                              id: string): string[] {
    const countries: string[] = impactData.filter((row) => row[id])
                                          .map((row) => row.country);
    return [...new Set(countries)];
}
*/

// read in the country groups from files
const pineCountries: string[] = loadObjectFromJSONFile("./pine5.json");
const dove94: string[] = loadObjectFromJSONFile("./dove94.json");
const dove96: string[] = loadObjectFromJSONFile("./dove96.json");
const gavi68: string[] = loadObjectFromJSONFile("./gavi68.json");
const gavi72: string[] = loadObjectFromJSONFile("./gavi72.json");
const gavi77: string[] = loadObjectFromJSONFile("./gavi77.json");

export const countryGroups: { [code: string]: string[] } = {
    pine: pineCountries,
    dove94: dove94,
    dove96: dove96,
    gavi68: gavi68,
    gavi72: gavi72,
    gavi77: gavi77
}

export const plottingVariables = ["year", "country", "continent", "region",
    "cofinance_status_2018", "activity_type", "disease", "vaccine",
    "touchstone", "support_type"];

export const reportInfo =
    loadObjectFromJSONFile("./reportInfo.json");
