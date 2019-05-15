const fs = require('fs');

import {countryDict, countries, touchstones, activityTypes, diseases, diseaseVaccines, 
        supportTypes} from "./fakeVariables.ts"

// Impact data
for (let i in touchstones) {
    var tsName = touchstones[i];
    var fileName = "data/test/impactData_" + tsName + ".json";
    fs.writeFile(fileName, generateData(tsName), function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("Fake data saved to " + fileName)
});
}

// activities.json
fs.writeFile("data/test/activities.json",
             JSON.stringify(activityTypes),
             function (err) {
                if (err) {
                    return console.log(err);
                }
             }
);

// countryCodes.json
fs.writeFile("data/test/countryCodes.json",
             JSON.stringify(countries),
             function (err) {
                if (err) {
                    return console.log(err);
                }
             }
);

// countryCodes.json
fs.writeFile("data/test/countryDictionary.json",
             JSON.stringify(countryDict),
             function (err) {
                if (err) {
                    return console.log(err);
                }
             }
);

// dates.json
fs.writeFile(
    "data/test/dates.json",
    JSON.stringify({"min":[2010],"max":[2020]}), 
    function (err) {
        if (err) {
            return console.log(err);
        }
    }
);

// dates.json
fs.writeFile(
    "data/test/diseaseVaccines.json",
    JSON.stringify(diseaseVaccines), 
    function (err) {
        if (err) {
            return console.log(err);
        }
    }
);

// dates.json
fs.writeFile(
    "data/test/reportInfo.json",
    JSON.stringify({
        "rep_id": ["test-fake-id"],
        "dep_id": ["test-another-fake-id"],
        "git_id": ["some-fake-git-id"]
    }),
    function (err) {
        if (err) {
            return console.log(err);
        }
    }
);

// support.json
fs.writeFile(
    "data/test/support.json",
    JSON.stringify(supportTypes), 
    function (err) {
        if (err) {
            return console.log(err);
        }
    }
);

// touchstones.json
fs.writeFile(
    "data/test/touchstones.json",
    JSON.stringify(touchstones), 
    function (err) {
        if (err) {
            return console.log(err);
        }
    }
);

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