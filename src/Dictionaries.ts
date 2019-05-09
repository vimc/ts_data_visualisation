import {loadObjectFromJSONFile, parseIntoDictionary} from "./Utils";

const countryStuff = loadObjectFromJSONFile("./countryDictionary.json");
export const countryDict = parseIntoDictionary(countryStuff, "country", "country_name");

export function countryCodeToName(countryCode: string) {
    return countryDict[countryCode];
}

export const vaccineDict: {[code: string]: string} = {
    HPV: "HPV",
    HepB: "Hepatitis B",
    HepB_BD: "HepB_BD",
    Hib3: "Hib3",
    JE: "Japanese encephalitis",
    MCV1: "MCV1",
    MCV2: "MCV2",
    Measles: "Measles",
    MenA: "MenA",
    PCV3: "PCV3",
    RCV2: "RCV2",
    Rota: "Rotavirus",
    Rubella: "Rubella",
    YF: "Yellow Fever",
};

export function vaccineCodeToName(vaccCode: string) {
    return vaccineDict[vaccCode];
}

export const diseaseDict: { [code: string]: string} = {
    HPV: "HPV",
    HepB: "Hepatitis B",
    Hib: "Hib",
    JE: "Japanese encephalitis",
    Measles: "Measles",
    MenA: "MenA",
    PCV: "PCV",
    Rota: "Rotavirus",
    Rubella: "Rubella",
    YF: "Yellow Fever",
};

export function diseaseCodeToName(disCode: string) {
    return diseaseDict[disCode];
}

export const diseaseVaccineLookup: {[code: string]: string[]} =
                        loadObjectFromJSONFile("./diseaseVaccines.json");

export const touchstoneYears: { [code: string]: number} = {
    "201210gavi-201303gavi" : 2011,
    "201210gavi-201810gavi" : 2017,
    "201310gavi"            : 2012,
    "201310gavi-201403gavi" : 2012,
    "201310gavi-201810gavi" : 2017,
    "201510gavi"            : 2014,
    "201510gavi-201810gavi" : 2017,
    "201710gavi"            : 2016,
    "201710gavi-201810gavi" : 2017,
};
