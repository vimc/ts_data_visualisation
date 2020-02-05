/*
 * This file reads the data files into javascript objects using the 
 * loadObjectFromJSONFile. There is nothing clever going on here. If there are
 * problems withany of these objects first check that the files exist in the
 * same directory as the app. Then check loadObjectFromJSONFile.
 *
 * We could infer these by examining the dataset - but this is problematic since
 * we do not load the entire dataset when the app launches so the lists might be
 * incomplete which would be difficult to recover from later.
*/
import {ImpactDataRow} from "./ImpactDataRow";
import {MetricsAndOptions} from "./MetricsAndOptions";
import {loadObjectFromJSONFile} from "./Utils";

export const countries: string[] =
  loadObjectFromJSONFile("./countryCodes.json");
export const touchstones: string[] =
  loadObjectFromJSONFile("./touchstones.json");
export const supportTypes: string[] =
  loadObjectFromJSONFile("./support.json");
export const activityTypes: string[] =
  loadObjectFromJSONFile("./activities.json");

/*
 * Since diseases and vaccines are so closely coupled we don't keep seperate
 * files with both in. Instead we have a file of the form
 * {
 *  diseaseA : [vaccineA1, vaccineA2],
 *  diseaseB : [vaccineB1],
 *  diseaseC : [vaccineC1, vaccineC2, vaccineC3]
 * }
 * We then parse this into seperate lists of diseases and vaccines
 */
export const disVac = loadObjectFromJSONFile("./diseaseVaccines.json");
export const diseases: string[] = [];
export const vaccines: string[] = [];
for (const k in disVac) {
  diseases.push(k);
  vaccines.concat(disVac[k]);
}

// this will be of the form {"min":[2000],"max":[2018]}
// has to be an array of numbers to get around some strange javascript behaviour
export const dates: {[code: string]: number[]} =
  loadObjectFromJSONFile("./dates.json");

export const countryGroups: { [code: string]: string[] } = {
  pine: loadObjectFromJSONFile("./pine5.json"),
  dove94: loadObjectFromJSONFile("./dove94.json"),
  dove96: loadObjectFromJSONFile("./dove96.json"),
  gavi68: loadObjectFromJSONFile("./gavi68.json"),
  gavi72: loadObjectFromJSONFile("./gavi72.json"),
  gavi77: loadObjectFromJSONFile("./gavi77.json"),
};

export const reportInfo: {[code: string]: string[]} =
  loadObjectFromJSONFile("./reportInfo.json");

export const metricsAndOptions: MetricsAndOptions =
      loadObjectFromJSONFile("./metricsAndOptions.json");
