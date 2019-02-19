const fs = require('fs');

import {countries, touchstones, activityTypes, diseases} from "../src/Data.ts"

fs.writeFile("data/test/impactData.js", generateData(), function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("Fake data saved to data/test/impactData.js")
});

function generateData() {

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
        Rota: ["Rotavirus"],
        Rubella: ["RCV2", "Rubella"],
        YF: ["Yellow Fever"]
    }

    const fakeImpactData =
        countries.flatMap((c) =>
            diseases.flatMap((d) =>
                diseaseVaccineLookup[d].flatMap((v) =>
                    touchstoneSubset.flatMap((t) =>
                        activityTypes.flatMap((a) =>
                            [2014, 2015, 2016, 2017, 2018, 2019, 2020]
                                .flatMap((y) => {
                                        return {
                                            "touchstone": t,
                                            "disease": d,
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
                    )
                )
            )
        );

    return "const impactData=" + JSON.stringify(fakeImpactData);
}

function randomNumber(floor, ceiling) {
    return Math.round(Math.random() * (ceiling - floor) * 100) / 100 + floor;
}