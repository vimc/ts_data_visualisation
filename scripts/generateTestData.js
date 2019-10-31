const fs = require('fs');
import JSZip from 'jszip';

import {countryDict, countries, touchstones, activityTypes, diseases, diseaseVaccines, 
        supportTypes, pineCountries, dove94, dove96, gavi68, gavi72, gavi77} from "./fakeVariables.ts"

// Impact data
for (let i in touchstones) {
    var tsName = touchstones[i];
    var fileName0 = "data/test/impactData_" + tsName + "_method_0.json";
    fs.writeFile(fileName0, generateData(tsName), function (err) {
        if (err) {
            return console.log(err);
        }
    });

    var fileName1 = "data/test/impactData_" + tsName + "_method_1.json";
        fs.writeFile(fileName1, generateData(tsName), function (err) {
        if (err) {
            return console.log(err);
        }
    });

    var fileName2 = "data/test/impactData_" + tsName + "_method_2.json";
    fs.writeFile(fileName2, generateData(tsName), function (err) {
        if (err) {
            return console.log(err);
        };
    })
    console.log("Fake data saved to " + fileName0);
    console.log("Fake data saved to " + fileName1);
    console.log("Fake data saved to " + fileName2);
}

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

writeToFile("data/test/activities.json", activityTypes);
writeToFile("data/test/countryCodes.json", countries);
writeToFile("data/test/countryDictionary.json", countryDict);
writeToFile("data/test/dates.json", {"min":[2010],"max":[2020]});
writeToFile("data/test/diseaseVaccines.json", diseaseVaccines);
writeToFile("data/test/reportInfo.json",
            { "rep_id": ["test-fake-id"],
              "dep_id": ["test-another-fake-id"],
              "git_id": ["some-fake-git-id"]
            }
           );
writeToFile("data/test/support.json", supportTypes);
writeToFile("data/test/dove94.json", dove94);
writeToFile("data/test/dove96.json", dove96);
writeToFile("data/test/gavi68.json", gavi68);
writeToFile("data/test/gavi72.json", gavi72);
writeToFile("data/test/gavi77.json", gavi77);
writeToFile("data/test/pine5.json", pineCountries);
writeToFile("data/test/touchstones.json", touchstones);
writeToZipFile("data/test/data_set.zip", 100);


function generateData(touchstone) {
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
        YF: ["YF"]
    }

    const fakeImpactData =
        countries.flatMap((c) =>
            diseases.flatMap((d) =>
                diseaseVaccineLookup[d].flatMap((v) =>
                    supportTypes.flatMap((s) =>
                        activityTypes.flatMap((a) =>
                            [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]
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

function randomNumber(floor, ceiling) {
    return Math.round(Math.random() * (ceiling - floor) * 100) / 100 + floor;
}