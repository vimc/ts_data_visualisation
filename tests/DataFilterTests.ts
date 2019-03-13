import {countries, touchstones, activityTypes, diseases, vaccines} from "../src/Data";
import {DataFilterer, DataFiltererOptions} from "../src/DataFilterer";
import {ImpactDataRow} from "../src/ImpactDataRow";
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
    const fakeImpactData: ImpactDataRow[] = [];




    //create fake Impact Data
    countries.map((c: string) =>
        diseases.map((d: string) =>
            diseaseVaccineLookup[d].map((v: string) =>
                activityTypes.map((a: string) =>
                    [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020].map((y: number) =>
                        touchstones.map((t: string) => {
                            fakeImpactData.push(<ImpactDataRow>{
                                "activity_type": a,
                                "touchstone": t,
                                "disease": d,
                                "is_focal": randomNumber(0, 1) > 0.5,
                                "support_type": randomNumber(0, 1) > 0.5 ? "gavi" : "other",
                                "vaccine": v,
                                "isGavi": true,
                                "country": c,
                                "countryName": `c-fullname`,
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

        const testObject = new DataFilterer();
        const out: [ImpactDataRow[], any[]] = testObject.filterByCompare(max,
                                                                         "disease",
                                                                         "deaths_averted",
                                                                         fakeImpactData);
        const filteredData = out[0];
        const compVars = out[1];

        // because of the random numbers in the fake data we can't put exact bounds on the length
        expect(filteredData).to.have.lengthOf.below(fakeImpactData.length);

        // we are expecting 'max' compare Variables
        expect(compVars).to.have.lengthOf(max);
        // all of the members of compvars should be diseases
        expect(diseases).to.include.members(compVars);

        expect(filteredData).to.be.an("array");
        //console.log(filteredData)
        expect(filteredData[0]).to.be.have.all.keys("activity_type",
                                                    "cases_averted",
                                                    "continent",
                                                    "country",
                                                    "countryName",
                                                    "deaths_averted",
                                                    "disease",
                                                    "isGavi",
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

        const testObject = new DataFilterer();
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
        const testObject = new DataFilterer();
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
        const testObject = new DataFilterer();
        const outGavi: ImpactDataRow[] = testObject.filterBySupport(fakeImpactData, "gavi");
        const sut: string[] = outGavi.map((row) => (row["support_type"]));
        expect(sut).to.include.members(["gavi"]);
        expect(sut).to.not.include.members(["other"]);
        expect(sut).to.not.include.members(["fish"]);

        const outOther: ImpactDataRow[] = testObject.filterBySupport(fakeImpactData, "other");
        const tus: string[] = outOther.map((row) => (row["support_type"]));
        expect(tus).to.include.members(["other"]);
        expect(tus).to.not.include.members(["gavi"]);
        expect(tus).to.not.include.members(["fish"]);

        const outBad: ImpactDataRow[] = testObject.filterBySupport(fakeImpactData, "fish");
        expect(outBad).to.have.lengthOf(0);
    })

    it("filterByTouchstone", () => {
        const testObject = new DataFilterer();
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
        const testObject = new DataFilterer();
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
        const testObject = new DataFilterer();
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
        const testObject = new DataFilterer();
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
        const testObject = new DataFilterer();
        const outGood: ImpactDataRow[] =
            testObject.filterByYear(fakeImpactData, 2013, 2014);

        const sut: number[] = outGood.map((row) => (row["year"]));
        const uniqueItems: number[] = [...new Set(sut)];
        expect(uniqueItems).to.include.members([2013, 2014]);
        expect(uniqueItems).to.not.include.members([2010, 2011, 2012, 2015, 2016, 2017, 2018, 2019, 2020]);

        const outBad: ImpactDataRow[] = testObject.filterByYear(fakeImpactData, 2014, 2013);
        expect(outBad).to.have.lengthOf(0);
    })
});