const fs = require('fs');
import JSZip from 'jszip';

import {fakeCountryDict, vimc98Countries, allCountries, touchstones, activityTypes, diseases, diseaseVaccines,
        supportTypes, countryGroups} from "./fakeVariables.ts"

let flag = process.argv.slice(-1)[0];
console.log("Generating data for the " + flag + " app.")


if (flag === "public") {
    var fileNameCohort = "data/test/firstPaper_1_" + "cohort" + ".json";
    fs.writeFile(fileNameCohort, generatePublicData("cohort"), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    console.log("Fake data saved to " + fileNameCohort);

    var fileNameCross = "data/test/firstPaper_1_" + "cross" + ".json";
    fs.writeFile(fileNameCross, generatePublicData("cross"), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    console.log("Fake data saved to " + fileNameCross);

} else if (flag === "paper2") {
    const paper2Prefix = "data/test/secondPaper_1_";

    var fileNameCohort =  paper2Prefix + "cohort" + ".json";
    fs.writeFile(fileNameCohort, generatePublicData("cohort", 2030, allCountries), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    console.log("Fake data saved to " + fileNameCohort);

    var fileNameCross = paper2Prefix + "cross" + ".json";
    fs.writeFile(fileNameCross, generatePublicData("cross", 2030, allCountries), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    console.log("Fake data saved to " + fileNameCross);

    var fileNameYearOfVac = paper2Prefix + "year_of_vac" + ".json";
    fs.writeFile(fileNameYearOfVac, generatePublicData("year_of_vac", 2030, allCountries), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    console.log("Fake data saved to " + fileNameYearOfVac);
} else if (flag === "private") {
    for (let i in touchstones) {
        var tsName = touchstones[i];
        var fileName0 = "data/test/impactData_" + tsName + "_year_of_vac.json";
        fs.writeFile(fileName0, generatePrivateData(tsName), function (err) {
            if (err) {
                return console.log(err);
            }
        });

        var fileName1 = "data/test/impactData_" + tsName + "_cross.json";
            fs.writeFile(fileName1, generatePrivateData(tsName), function (err) {
            if (err) {
                return console.log(err);
            }
        });

        var fileName2 = "data/test/impactData_" + tsName + "_cohort.json";
        fs.writeFile(fileName2, generatePrivateData(tsName), function (err) {
            if (err) {
                return console.log(err);
            };
        })
        console.log("Fake data saved to " + fileName0);
        console.log("Fake data saved to " + fileName1);
        console.log("Fake data saved to " + fileName2);
    }
}
// Impact data


function writeToFile(path, data) {
    fs.writeFile(path, JSON.stringify(data),
                 function (err) {
                    if (err) {
                        return console.log(err);
                    }
                 }
    );
}

function writeToZipFile(path, lines) {
    const  t = Array(lines).fill(0).map(() => {
        const a = randomNumber(0, 10000) + "";
        return a;
    });
    const str = t.join();
    let zip = new JSZip();
    zip.file("data_set.csv", str);
    zip.file("report_id.txt", "test-another-fake-id");
    zip.generateNodeStream({type:'nodebuffer', streamFiles:true})
       .pipe(fs.createWriteStream(path))
       .on('finish', function () {
           console.log("Zip file saved to " + path + ".");
        });
}

if (flag === "paper2") {
    writeToFile("data/test/countryCodes.json", vimc98Countries);
} else {
    writeToFile("data/test/countryCodes.json", allCountries);
}
writeToFile("data/test/countryDictionary.json", fakeCountryDict);

const dates = flag === "paper2" ? {"min":[2000],"max":[2030]} : {"min":[2000],"max":[2019]};
writeToFile("data/test/dates.json", dates);
writeToFile("data/test/diseaseVaccines.json", diseaseVaccines);
writeToFile("data/test/reportInfo.json",
            { "rep_id": ["test-fake-id"],
              "dep_id": ["test-another-fake-id", "test-yet-another-fake-id"],
              "dep_name": ["report-name", "another-report-name"],
              "git_id": ["some-fake-git-id"]
            }
           );

writeToFile("data/test/dove94.json", countryGroups.dove94);
writeToFile("data/test/dove96.json", countryGroups.dove96);
writeToFile("data/test/gavi68.json", countryGroups.gavi68);
writeToFile("data/test/gavi72.json", countryGroups.gavi72);
writeToFile("data/test/gavi73.json", countryGroups.gavi73);
writeToFile("data/test/gavi77.json", countryGroups.gavi77);
writeToFile("data/test/pine5.json", countryGroups.pine);
if (flag === "paper2") {
    writeToFile("data/test/vimc98.json", countryGroups.vimc98)
} else {
    writeToFile("data/test/activities.json", activityTypes);
    writeToFile("data/test/touchstones.json", touchstones);
    writeToFile("data/test/support.json", supportTypes);
}

writeToZipFile("data/test/data_set.zip", 100);

// are we creating a public app?
if (flag === "public") {
    writeToFile("data/test/metricsAndOptions.json",
                    {"mode": ["public"],
                     "metrics": ["deaths",
                                 "deaths_averted",
                                 "deaths_novac",
                                 "dalys",
                                 "dalys_averted",
                                 "dalys_novac"],
                      "methods": ["cross", "cohort"],
                      "dualOptions": ["country",
                                      "year",
                                      "disease"],
                      "stratOptions": [],
                      "filterOptions": ["age_group"],
                      "uiVisible": ["uncertainty"]
                    }
                   );
} else if (flag === "paper2") {
    writeToFile("data/test/metricsAndOptions.json",
                    {"mode": ["paper2"],
                     "metrics": ["deaths",
                                 "deaths_averted",
                                 "deaths_novac",
                                 "dalys",
                                 "dalys_averted",
                                 "dalys_novac"],
                      "methods": ["cross", "cohort", "year_of_vac"],
                      "dualOptions": ["country",
                                      "year",
                                      "disease"],
                      "stratOptions": [],
                      "filterOptions": ["age_group"],
                      "uiVisible": ["uncertainty"]
                    }
                   );
} else if (flag === "private") {
    writeToFile("data/test/metricsAndOptions.json",
                {"mode": ["private"],
                 "metrics": ["deaths_averted",
                             "deaths_averted_rate",
                             "cases_averted",
                             "cases_averted_rate",
                             "dalys_averted",
                             "dalys_averted_rate",
                             "coverage",
                             "fvps"],
                  "methods": ["cross", "cohort", "year_of_vac"],
                  "dualOptions": ["country",
                                  "year",
                                  "touchstone",
                                  "activity_type",
                                  "support_type",
                                  "vaccine"],
                  "stratOptions": ["continent", "disease", "region"],
                  "filterOptions": [],
                  "uiVisible": [],
                  "secretOptions": {"is_focal": [true]}
                }
               );    
}

function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function generatePrivateData(touchstone) {
    const touchstoneSubset = touchstones.slice(0, 3);

    // can't import typescript object, so just redefining this here
    const diseaseVaccineLookup = {
        HepB: ["HepB", "HepB_BD"],
        Hib: ["Hib3"],
        HPV: ["HPV"],
        JE: ["JE"],
        Measles: ["MCV1", "MCV2", "Measles"],
        MenA: ["MenA"],
        PCV: ["PCV3"],
        Rota: ["Rota"],
        Rubella: ["RCV2", "Rubella"],
        YF: ["YF"],
        "All Diseases": ["All Vaccines"]
    }

    const fakeImpactData =
        vimc98countries.flatMap((c) =>
            diseases.flatMap((d) =>
                diseaseVaccineLookup[d].flatMap((v) =>
                    supportTypes.flatMap((s) =>
                        activityTypes.flatMap((a) =>
                            range(2000, 2019)
                                .flatMap((y) => {
                                    return {
                                        "touchstone": touchstone,
                                        "disease": d,
                                        "is_focal": true,
                                        "activity_type": a,
                                        "support_type": s,
                                        "vaccine": v,
                                        "gavi73": true,
                                        "country": c,
                                        "country_name": `c-fullname`,
                                        "year": y,
                                        "coverage": randomNumber(0, 1),
                                        "target_population": randomNumber(100000, 200000),
                                        "fvps": randomNumber(10000, 20000),
                                        "deaths_averted": randomNumber(10000, 20000),
                                        "deaths_averted_rate": randomNumber(0, 0.8),
                                        "cases_averted": randomNumber(10000, 20000),
                                        "cases_averted_rate": randomNumber(0, 0.8),
                                        "dalys_averted": randomNumber(10000, 20000),
                                        "dalys_averted_rate": randomNumber(0, 0.8),
                                        "region": "Southern Asia"
                                    }
                                }
                            )
                        )
                    )
                )
            )
        );

    return JSON.stringify(fakeImpactData);
}

function generatePublicData(method, lastYear = 2019, countries = vimc98Countries) {
    const fakeImpactData =
        countries.flatMap((c) =>
            diseases.flatMap((d) =>
                ["all", "under5"].flatMap((a) =>
                    range(2000, lastYear).flatMap((y) => {
                        let death    = randomNumber(10000, 20000);
                        let death_av = randomNumber(10000, 20000);
                        let death_nv = randomNumber(10000, 20000);
                        let dalys    = randomNumber(10000, 20000);
                        let dalys_av = randomNumber(10000, 20000);
                        let dalys_nv = randomNumber(10000, 20000);
                        return {
                            "year": y,
                            "disease": d,
                            "age_group": a,
                            "method" : method,
                            "country": c,
                            "country_name": `c-fullname`,
                            "deaths_lo":death - randomNumber(0, 2500),
                            "deaths":death,
                            "deaths_hi":death + randomNumber(0, 2500),
                            "deaths_nv_lo":death_nv - randomNumber(0, 2500),
                            "deaths_no_vac":death_nv,
                            "deaths_nv_hi":death_nv + randomNumber(0, 2500),
                            "deaths_av_lo":death_av - randomNumber(0, 2500),
                            "deaths_averted":death_av,
                            "deaths_av_hi":death_av + randomNumber(0, 2500),
                            "dalys_lo":dalys - randomNumber(0, 2500),
                            "dalys":dalys,
                            "dalys_hi":dalys + randomNumber(0, 2500),
                            "dalys_nv_lo":dalys_nv - randomNumber(0, 2500),
                            "dalys_no_vac":dalys_nv,
                            "dalys_nv_hi":dalys_nv + randomNumber(0, 2500),
                            "dalys_av_lo":dalys_av - randomNumber(0, 2500),
                            "dalys_averted":dalys_av,
                            "dalys_av_hi":dalys_av + randomNumber(0, 2500),
                        }
                    }
                )
            )
        )
    );

    return JSON.stringify(fakeImpactData);
}

function randomNumber(floor, ceiling) {
    return Math.round(Math.random() * (ceiling - floor) * 100) / 100 + floor;
}
