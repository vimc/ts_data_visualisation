import {countries, touchstones, activityTypes, diseases, vaccines} from "../scripts/fakeVariables";
import {DataFilterer, DataFiltererOptions, UniqueData} from "../src/DataFilterer";
import {ImpactDataRow} from "../src/ImpactDataRow";
import {plotColours} from "../src/PlotColours";
import {expect} from "chai";

function randomNumber(floor: number, ceiling: number) : number {
    return Math.round(Math.random() * (ceiling - floor) * 100) / 100 + floor;
};

const diseaseVaccineLookup: { [p: string]: string[] } = {
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
};

describe("DataFilterer", () => {
    const testObject = new DataFilterer();

    const fakeImpactData: ImpactDataRow[] = [];
    //create fake Impact Data
    countries.slice(0, 10).map((c: string) =>
        diseases.slice(0, 5).map((d: string) =>
            diseaseVaccineLookup[d].map((v: string) =>
                activityTypes.map((a: string) =>
                    [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020].map((y: number) =>
                        touchstones.slice(0, 5).map((t: string) => {
                            fakeImpactData.push(<ImpactDataRow>{
                                "activity_type": a,
                                "touchstone": t,
                                "disease": d,
                                "is_focal": randomNumber(0, 1) > 0.5,
                                "support_type": randomNumber(0, 1) > 0.5 ? "gavi" : "other",
                                "vaccine": v,
                                "is_gavi": true,
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
                                "region": "Southern Asia",
                                "continent": "Asia",
                                "rate_type": "123",
                            })
                        })
                    )
                )
            )
        )
    );

    it("filterByCompare", () => {
        const max: number = 2;

        const out: UniqueData = testObject.filterByxAxis(max,
                                                         "disease",
                                                         "deaths_averted",
                                                         fakeImpactData);
        const filteredData = out.data;
        const compVars = out.xAxisVals;

        // because of the random numbers in the fake data we can't put exact bounds on the length
        expect(filteredData).to.have.lengthOf.below(fakeImpactData.length);
        // check that all elements of metric are numberic
        const metric: number[] = filteredData.map((row) => row["deaths_averted"])
        metric.map((x) => expect(x).to.be.a("number"))

        // we are expecting 'max' compare Variables
        expect(compVars).to.have.lengthOf(max);
        // all of the members of compvars should be diseases
        expect(diseases).to.include.members(compVars);

        expect(filteredData).to.be.an("array");
        expect(filteredData[0]).to.be.have.all.keys("activity_type",
                                                    "cases_averted",
                                                    "continent",
                                                    "country",
                                                    "country_name",
                                                    "deaths_averted",
                                                    "disease",
                                                    "is_gavi",
                                                    "is_focal",
                                                    "rate_type",
                                                    "support_type",
                                                    "touchstone",
                                                    "vaccine",
                                                    "year",
                                                    "cases_averted_rate",
                                                    "coverage",
                                                    "dalys_averted",
                                                    "dalys_averted_rate",
                                                    "deaths_averted_rate",
                                                    "fvps",
                                                    "region",
                                                    "target_population"
                                                    )
        const sut: string[] = filteredData.map((row) => (row["disease"]));
        const uniqueItems: string[] = [...new Set(sut)];
        expect(uniqueItems).to.have.lengthOf(max);
    })

    it("getUniqueVariables", () => {
        const max: number = 2;

        const out1: any[] = 
            testObject.getUniqueVariables(max, "activity_type", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect(activityTypes).to.include.members(out1);

        const out2: any[] = 
            testObject.getUniqueVariables(max, "disease", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect(diseases).to.include.members(out2);

        const out3: any[] = 
            testObject.getUniqueVariables(max, "continent", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect(["Asia"]).to.include.members(out3);

        const out4: any[] = 
            testObject.getUniqueVariables(max, "country", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect(countries).to.include.members(out4);


        const out5: any[] = 
            testObject.getUniqueVariables(max, "touchstone", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect(touchstones).to.include.members(out5);
    })

    it("filterByFocality", () => {
        const outTrue: ImpactDataRow[] = testObject.filterByFocality(fakeImpactData, true);
        const sut: boolean[] = outTrue.map((row) => (row["is_focal"]));
        expect(sut).to.include.members([true]);
        expect(sut).to.not.include.members([false]);

        const outFalse: ImpactDataRow[] = testObject.filterByFocality(fakeImpactData, false);
        const tus: boolean[] = outFalse.map((row) => (row["is_focal"]));
        expect(tus).to.include.members([false]);
        expect(tus).to.not.include.members([true]);
    })

    it("filterBySupport", () => {
        const outGavi: ImpactDataRow[] = testObject.filterBySupport(fakeImpactData, ["gavi"]);
        const sut: string[] = outGavi.map((row) => (row["support_type"]));
        expect(sut).to.include.members(["gavi"]);
        expect(sut).to.not.include.members(["other"]);
        expect(sut).to.not.include.members(["fish"]);

        const outOther: ImpactDataRow[] = testObject.filterBySupport(fakeImpactData, ["other"]);
        const tus: string[] = outOther.map((row) => (row["support_type"]));
        expect(tus).to.include.members(["other"]);
        expect(tus).to.not.include.members(["gavi"]);
        expect(tus).to.not.include.members(["fish"]);

        const outBad: ImpactDataRow[] = testObject.filterBySupport(fakeImpactData, ["fish"]);
        expect(outBad).to.have.lengthOf(0);
    })

    it("filterByTouchstone", () => {
        const outGood: ImpactDataRow[] =
            testObject.filterByTouchstone(fakeImpactData, touchstones.slice(0, 2));

        const sut: string[] = outGood.map((row) => (row["touchstone"]));
        const uniqueItems: string[] = [...new Set(sut)];
        expect(uniqueItems).to.include.members(touchstones.slice(0, 2));
        expect(uniqueItems).to.not.include.members(touchstones.slice(2));

        const outBad: ImpactDataRow[] = testObject.filterByTouchstone(fakeImpactData, ["fish"]);
        expect(outBad).to.have.lengthOf(0);
    })

    it("filterByVaccine", () => {
        const outGood: ImpactDataRow[] =
            testObject.filterByVaccine(fakeImpactData, vaccines.slice(0, 2));

        const sut: string[] = outGood.map((row) => (row["vaccine"]));
        const uniqueItems: string[] = [...new Set(sut)];
        expect(uniqueItems).to.include.members(vaccines.slice(0, 2));
        expect(uniqueItems).to.not.include.members(vaccines.slice(2));

        const outBad: ImpactDataRow[] = testObject.filterByVaccine(fakeImpactData, ["fish"]);
        expect(outBad).to.have.lengthOf(0);
    })

    it("filterByCountrySet", () => {
        const outGood: ImpactDataRow[] =
            testObject.filterByCountrySet(fakeImpactData, countries.slice(0, 2));

        const sut: string[] = outGood.map((row) => (row["country"]));
        const uniqueItems: string[] = [...new Set(sut)];
        expect(uniqueItems).to.include.members(countries.slice(0, 2));
        expect(uniqueItems).to.not.include.members(countries.slice(2));

        const outBad: ImpactDataRow[] = testObject.filterByCountrySet(fakeImpactData, ["fish"]);
        expect(outBad).to.have.lengthOf(0);
    })

    it("filterByActivityType", () => {
        const outGood: ImpactDataRow[] =
            testObject.filterByActivityType(fakeImpactData, activityTypes.slice(0, 2));

        const sut: string[] = outGood.map((row) => (row["activity_type"]));
        const uniqueItems: string[] = [...new Set(sut)];
        expect(uniqueItems).to.include.members(activityTypes.slice(0, 2));
        expect(uniqueItems).to.not.include.members(activityTypes.slice(2));

        const outBad: ImpactDataRow[] = testObject.filterByActivityType(fakeImpactData, ["fish"]);
        expect(outBad).to.have.lengthOf(0);
    })

    it("filterByYear", () => {
        const outGood: ImpactDataRow[] =
            testObject.filterByYear(fakeImpactData, 2013, 2014);

        const sut: number[] = outGood.map((row) => (row["year"]));
        const uniqueItems: number[] = [...new Set(sut)];
        expect(uniqueItems).to.include.members([2013, 2014]);
        expect(uniqueItems).to.not.include.members([2010, 2011, 2012, 2015, 2016, 2017, 2018, 2019, 2020]);

        const outBad: ImpactDataRow[] = testObject.filterByYear(fakeImpactData, 2014, 2013);
        expect(outBad).to.have.lengthOf(0);
    })

    it("meanVariables", () => {
        const out1 = testObject.meanVariables("coverage");
        expect(out1).to.include({top: "fvps", bottom: "target_population"});

        const out2 = testObject.meanVariables("deaths_averted_rate");
        expect(out2).to.include({top: "deaths_averted", bottom: "fvps"});

        const out3 = testObject.meanVariables("cases_averted_rate");
        expect(out3).to.include({top: "cases_averted", bottom: "fvps"});

        const out4 = testObject.meanVariables("fish");
        expect(out4).to.include({top: "fish"});
    })


    it("ArrangeSplitData", () => {
        const out = testObject.ArrangeSplitData("year", "disease",
                                                diseases.slice(0, 5),
                                                fakeImpactData);
        for (const d of diseases.slice(0, 5)) {
            for (const y of [2010, 2011, 2012, 2013, 2014]) {
                for (const idr of out[d][y.toString()]) {
                    expect(idr.disease).to.equal(d)
                    expect(idr.year).to.equal(y)
                }
            }
        }
    })

    it("filterByNone", () => {
        const out = testObject.ArrangeSplitData("year", "none",
                                                [],
                                                fakeImpactData);
        // does not really test anything other than the code runs without error!
        for (const y of [2010, 2011, 2012, 2013, 2014]) {
            for (const idr of out["none"][y.toString()]) {
                expect(idr.year).to.equal(y)
            }
        }
    })

    it("filterData", () => {
        let fakeOptions: DataFiltererOptions = {
            metric: "deaths_averted",
            maxPlot: 10,
            xAxis: "continent",
            yAxis: "year",
            yearLow: 2005,
            yearHigh: 2025,
            activityTypes: ["routine","campaign"],
            selectedCountries: countries.slice(0, 5),
            selectedVaccines: ["HepB_BD", "MCV2", "Rota"],
            selectedTouchstones: touchstones.slice(0, 2),
            plotType: "Impact",
            supportType: ["gavi"],
            cumulative: true,
            timeSeries: true,
        }
        // the functionality of this function covered in the unit testing above
        // all these tests do is make sure the main function runs without an
        // error
        let out = testObject.filterData(fakeOptions, fakeImpactData,
                                          plotColours);

        fakeOptions.metric = "deaths_averted_rate",
        fakeOptions.xAxis = "year";
        fakeOptions.yAxis = "continent";

        out = testObject.calculateMean(fakeOptions, fakeImpactData,
                                          plotColours);
    })
});
