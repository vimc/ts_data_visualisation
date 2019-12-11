import {loadObjectFromJSONFile, parseIntoDictionary} from "./Utils";

const countryStuff = loadObjectFromJSONFile("./countryDictionary.json");
export const countryDict = parseIntoDictionary(countryStuff, "country", "country_name");

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

export const diseaseVaccineLookup: {[code: string]: string[]} =
            loadObjectFromJSONFile("./diseaseVaccines.json");
