import {ImpactDataRow} from "./ImpactDataRow";
import {MetricsAndOptions} from "./MetricsAndOptions";
import {loadObjectFromJSONFile} from "./Utils";

export const metricsAndOptions: MetricsAndOptions =
      loadObjectFromJSONFile("./metricsAndOptions.json");

const paper2 = metricsAndOptions.mode == "paper2";

export const countries: string[] =
  loadObjectFromJSONFile("./countryCodes.json");
export const touchstones: string[] =
  paper2 ? [] : loadObjectFromJSONFile("./touchstones.json");
export const supportTypes: string[] =
  paper2 ? [] : loadObjectFromJSONFile("./support.json");
export const activityTypes: string[] =
  paper2 ? [] : loadObjectFromJSONFile("./activities.json");

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
export const countryGroups: { [code: string]: string[] } = {
  pine: loadObjectFromJSONFile("./pine5.json"),
  dove94: loadObjectFromJSONFile("./dove94.json"),
  dove96: loadObjectFromJSONFile("./dove96.json"),
  gavi68: loadObjectFromJSONFile("./gavi68.json"),
  gavi72: loadObjectFromJSONFile("./gavi72.json"),
  gavi73: loadObjectFromJSONFile("./gavi73.json"),
  gavi77: loadObjectFromJSONFile("./gavi77.json"),
};
if (paper2) {
  countryGroups["vimc98"] = loadObjectFromJSONFile("./vimc98.json")
}

const reportInfoFirstPaper = loadObjectFromJSONFile("./reportInfoFirstPaper.json");
export const reportInfo = reportInfoFirstPaper.rep_id === undefined ?
    loadObjectFromJSONFile("./reportInfo.json") : reportInfoFirstPaper;


