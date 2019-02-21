const fs = require('fs');

import {countries, vaccines, touchstones, activityTypes} from "../src/Data.ts"

for (let i in touchstones) {
    var tsName = touchstones[i];
    var fileName = "data/test/impactData_" + tsName + ".js";
    fs.writeFile(fileName, generateData(tsName), function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("Fake data saved to " + fileName)
});
}

function generateData(touchstone) {

    const touchstoneSubset = touchstones.slice(0, 3);

    const fakeImpactData =
        countries.flatMap((c) =>
            vaccines.flatMap((v) =>
//               touchstoneSubset.flatMap((t) =>
                    activityTypes.flatMap((a) =>
                        [2014, 2015, 2016, 2017, 2018, 2019, 2020]
                            .flatMap((y) => {
                                    return {
                                        "touchstone": touchstone,
                                        "disease": v,
                                        "is_focal": true,
                                        "activity_type": a,
                                        "support_type": "gavi",
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
//                )
            )
        );

    return JSON.stringify(fakeImpactData);
}

function randomNumber(floor, ceiling) {
    return Math.round(Math.random() * (ceiling - floor) * 100) / 100 + floor;
}