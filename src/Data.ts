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

// These can't be infered from the data so we have to hard code them somewhere
export const pineCountries = ["COD", "ETH", "IND", "NGA", "PAK"];

const notDove94 = ["ALB", "BIH", "CHN", "TUN"];
export const dove94 = countries.filter((x) => notDove94.indexOf(x) < 0 );

const notDove96 = ["TUN", "XK"];
export const dove96 = countries.filter((x) => notDove96.indexOf(x) < 0 );

const notGavi68 = ["ALB", "BIH", "BLZ", "BTN", "CHN", "CPV", "EGY",
    "FJI", "FSM", "GTM", "HND", "IRQ", "LKA", "MAR", "MHL", "MNG", "PHL", "PRY",
    "PSE", "SLV", "SWZ", "SYR", "TKM", "TON", "TUN", "TUV", "UKR", "VUT", "WSM",
    "XK"];
export const gavi68 = countries.filter((x) => notGavi68.indexOf(x) < 0 );

const notGavi72 = ["ALB", "BIH", "BLZ", "CHN", "CPV", "EGY", "FJI",
    "FSM", "GTM", "IRQ", "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR",
    "TKM", "TON", "TUN", "TUV", "UKR", "VUT", "WSM", "XK"];
export const gavi72 = countries.filter((x) => notGavi72.indexOf(x) < 0 );

const notGavi77 = ["BLZ", "CPV", "EGY", "FJI", "FSM", "GTM", "IRQ",
    "MAR", "MHL", "PHL", "PRY", "PSE", "SLV", "SWZ", "SYR", "TON", "TUN", "TUV",
    "VUT", "WSM", "XK"];
export const gavi77 = countries.filter((x) => notGavi77.indexOf(x) < 0 );

export const plottingVariables = ["year", "country", "continent", "region",
    "cofinance_status_2018", "activity_type", "disease", "vaccine",
    "touchstone", "support_type"];

export const reportInfo =
    loadObjectFromJSONFile("./reportInfo.json");
