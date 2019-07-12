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
export const pineCountries: string[] = loadObjectFromJSONFile("./pine5.json");
export const dove94: string[] = loadObjectFromJSONFile("./dove94.json");
export const dove96: string[] = loadObjectFromJSONFile("./dove96.json");
export const gavi68: string[] = loadObjectFromJSONFile("./gavi68.json");
export const gavi72: string[] = loadObjectFromJSONFile("./gavi72.json");
export const gavi77: string[] = loadObjectFromJSONFile("./gavi77.json");

export const plottingVariables = ["year", "country", "continent", "region",
    "cofinance_status_2018", "activity_type", "disease", "vaccine",
    "touchstone", "support_type"];

export const reportInfo =
    loadObjectFromJSONFile("./reportInfo.json");
