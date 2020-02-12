import {countries, touchstones, activityTypes, diseases, vaccines, fakeCountryDict} from "../scripts/fakeVariables";
import {upperLowerNames, DataFilterer, DataFiltererOptions, UniqueData} from "../src/DataFilterer";
import {ImpactDataRow} from "../src/ImpactDataRow";
import {MetricsAndOptions} from "../src/MetricsAndOptions";
import {plotColours} from "../src/PlotColours";
import {parseIntoDictionary} from "../src/Utils";
import {expect} from "chai";
import * as Color from "color";

import * as sinon from "sinon";

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
                                "age_group": "under_5",
                                "country": c,
                                "country_name": `c-fullname`,
                                "year": y,
                                "coverage": randomNumber(0, 1),
                                "target_population": randomNumber(100000, 200000),
                                "fvps": randomNumber(10000, 20000),
                                "deaths": randomNumber(10000, 20000),
                                "deaths_averted": randomNumber(10000, 20000),
                                "deaths_averted_rate": randomNumber(0, 0.8),
                                "cases": randomNumber(10000, 20000),
                                "cases_averted": randomNumber(10000, 20000),
                                "cases_averted_rate": randomNumber(0, 0.8),
                                "dalys": randomNumber(10000, 20000),
                                "dalys_averted": randomNumber(10000, 20000),
                                "dalys_averted_rate": randomNumber(0, 0.8),
                                "region": "Southern Asia",
                                "continent": "Asia",
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
                                                    "age_group",
                                                    "is_focal",
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
                                                    "target_population",
                                                    "deaths",
                                                    "dalys",
                                                    "cases"
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

        const out6: any[] =
            testObject.getUniqueVariables(max, "year", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect(out6).to.include.members([2010, 2011]);

        const out7: any[] =
            testObject.getUniqueVariables(5, "year", "deaths_averted", fakeImpactData);
        // all of the members of compvars should be diseases
        expect([2010, 2011, 2012, 2013, 2014]).to.include.members(out7);
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

    it("filterData Impact", () => {
        let fakeOptions: DataFiltererOptions = {
            metric: "deaths_averted_rate",
            maxPlot: 10,
            xAxis: "continent",
            yAxis: "country",
            yearLow: 2005,
            yearHigh: 2025,
            activityTypes: ["routine","campaign"],
            selectedCountries: countries.slice(0, 5),
            selectedVaccines: ["HepB_BD", "MCV2", "Rota"],
            selectedTouchstones: touchstones.slice(0, 2),
            plotType: "Impact",
            supportType: ["gavi"],
            cumulative: true,
            ageGroup: "under5",
            plotUncertainity: true,
        }
        let fakeMetricAndOptions: MetricsAndOptions = {
            mode: "public",
            metrics: ["deaths", "deaths_averted", "deaths_averted_rate"],
            methods: ["cross", "cohort"],
            dualOptions: ["country", "year", "activity_type", "vaccine", "touchstone"],
            stratOptions: ["continent"],
            filterOptions: [],
            uiVisible: [],
            secretOptions: { is_focal: true }
        }
        // the functionality of this function covered in the unit testing above
        // all these tests do is make sure the main function runs without an
        // error
        let out1 = testObject.filterData(fakeOptions, fakeImpactData,
                                        fakeMetricAndOptions, plotColours, null);

        fakeOptions.metric = "deaths_averted_rate"
        const countryDict = parseIntoDictionary(fakeCountryDict, "country", "country_name");
        let out2 = testObject.filterData(fakeOptions, fakeImpactData,
                                    fakeMetricAndOptions, plotColours, countryDict);
    })

    it("filterData Time series", () => {
        let fakeOptions: DataFiltererOptions = {
            metric: "deaths",
            maxPlot: 10,
            xAxis: "year",
            yAxis: "continent",
            yearLow: 2005,
            yearHigh: 2025,
            activityTypes: ["routine","campaign"],
            selectedCountries: countries.slice(0, 5),
            selectedVaccines: ["HepB_BD", "MCV2", "Rota"],
            selectedDiseases: diseases.slice(0, 5),
            selectedTouchstones: touchstones.slice(0, 2),
            plotType: "Time series",
            supportType: ["gavi"],
            cumulative: true,
            ageGroup: "under_5",
            plotUncertainity: true,
        }

        let fakeMetricAndOptions: MetricsAndOptions = {
            mode: "public",
            metrics: ["deaths", "deaths_averted", "deaths_averted_rate"],
            methods: ["cross", "cohort"],
            dualOptions: ["country", "year", "support_type", "age_group", "disease"],
            stratOptions: ["continent"],
            filterOptions: [],
            uiVisible: []
        }

        let out = testObject.filterData(fakeOptions, fakeImpactData,
                                        fakeMetricAndOptions, plotColours, null);

        fakeOptions.xAxis = "country"
        out = testObject.filterData(fakeOptions, fakeImpactData,
                                    fakeMetricAndOptions, plotColours, null);
    })

    it("upperLowerNames", () => {
        let out = upperLowerNames("dalys");

        expect(out).to.include({low: "dalys_lo", high:"dalys_hi"});

        out = upperLowerNames("dalys_averted");
        expect(out).to.include({low: "dalys_av_lo", high:"dalys_av_hi"});

        out = upperLowerNames("dalys_no_vac");
        expect(out).to.include({low: "dalys_nv_lo", high:"dalys_nv_hi"});

        out = upperLowerNames("deaths");
        expect(out).to.include({low: "deaths_lo", high:"deaths_hi"});

        out = upperLowerNames("deaths_averted");
        expect(out).to.include({low: "deaths_av_lo", high:"deaths_av_hi"});

        out = upperLowerNames("deaths_no_vac");
        expect(out).to.include({low: "deaths_nv_lo", high:"deaths_nv_hi"});

        out = upperLowerNames("cases");
        expect(out).to.include({low: "cases_lo", high:"cases_hi"});

        out = upperLowerNames("cases_averted");
        expect(out).to.include({low: "cases_av_lo", high:"cases_av_hi"});

        out = upperLowerNames("cases_no_vac");
        expect(out).to.include({low: "cases_nv_lo", high:"cases_nv_hi"});

        out = upperLowerNames("coverage");
        expect(out).to.include({});
        out = upperLowerNames("deathsRate");
        expect(out).to.include({});
        out = upperLowerNames("casesRate");
        expect(out).to.include({});
        out = upperLowerNames("dalysRate");
        expect(out).to.include({});
        out = upperLowerNames("fvps");
        expect(out).to.include({});


        let spy = sinon.spy(console, 'log');  

        out = upperLowerNames("BAD STRING");
        sinon.assert.calledWith(spy, "Unexpected metric BAD STRING");
        expect(out).to.include({});    

        spy.restore();

    })

    it("getDataRow", () => {
        let out = testObject.getChartJsRow("Time series",
                                           "#0B588E",
                                           "label",
                                           [1,2,3,4,5,6,7,8,9,10,11,12],
                                           "low");
        expect(out).to.include({
            borderColor: '#0B588E',
            borderWidth: 0.1,
            fill: '+2',
            label: 'label_low',
            lineTension: 0,
            pointBackgroundColor: '#0B588E',
            pointHitRadius: 15,
            pointHoverRadius: 0.0,
            pointRadius: 0.0,
            pointStyle: 'circle'});

        expect(out.data).to.include.members([1,2,3,4,5,6,7,8,9,10,11,12]);
        expect(out.backgroundColor).to.
                               equal(Color('#0B588E').alpha(0.5).hsl().string())

        out = testObject.getChartJsRow("Time series",
                                       "#0B588E",
                                       "label",
                                       [7,8,9,10,11,12],
                                       "mid");

        expect(out.borderWidth).to.equal(2);
        expect(out.fill).to.equal(false);
        expect(out.label).to.equal("label");
        expect(out.pointHoverRadius).to.equal(5.0);
        expect(out.pointRadius).to.equal(2.5);

        out = testObject.getChartJsRow("Time series",
                                       "#0B588E",
                                       "label",
                                       [1,2,3,4,5,6,7,8,9,10,11,12],
                                       "high");

        expect(out.pointRadius).to.equal(0);
        expect(out.fill).to.equal(false);
        expect(out.borderWidth).to.equal(0.1);
        expect(out.label).to.equal("label_high");

        out = testObject.getChartJsRow("Not time series",
                                       "#0B588E",
                                       "label",
                                       [7,8,9,10,11,12],
                                       "mid");
        
        expect(out).to.include({backgroundColor: '#0B588E', label: 'label'});
        expect(out.data).to.include.members([7,8,9,10,11,12]);
        expect(out.label).to.equal("label");
    })

    it("getColours", () => {
        let plotColours = {"none": "#0000C0",
                           "HPV":  "#BEBADA",
                           "HepB": "#8DD3C7"};

        let niceColours = {aqua:  "#00ffff",
                           azure: "#f0ffff",
                           beige: "#f5f5dc"}

        // these tests should do nothing
        let out = testObject.getColour("none", plotColours, niceColours)
        out = testObject.getColour("HPV", plotColours, niceColours)
        out = testObject.getColour("HepB", plotColours, niceColours)
        expect(Object.keys(plotColours)).to.have.lengthOf(3)
        expect(Object.keys(niceColours)).to.have.lengthOf(3)

        let spy = sinon.spy(console, 'log');

        out = testObject.getColour("a", plotColours, niceColours)
        expect(Object.keys(plotColours)).to.have.lengthOf(4)
        expect(Object.keys(niceColours)).to.have.lengthOf(2)
        sinon.assert.calledWith(spy, "Warning: a does not have a default colour");

        out = testObject.getColour("b", plotColours, niceColours)
        expect(Object.keys(plotColours)).to.have.lengthOf(5)
        expect(Object.keys(niceColours)).to.have.lengthOf(1)

        out = testObject.getColour("c", plotColours, niceColours)
        expect(Object.keys(plotColours)).to.have.lengthOf(6)
        expect(Object.keys(niceColours)).to.have.lengthOf(0)
        expect(Object.keys(plotColours)).to.contain("a")
        expect(Object.keys(plotColours)).to.contain("b")
        expect(Object.keys(plotColours)).to.contain("c")

        out = testObject.getColour("d", plotColours, niceColours)
        expect(Object.keys(plotColours)).to.have.lengthOf(7)
        expect(Object.keys(niceColours)).to.have.lengthOf(0)
        sinon.assert.calledWith(spy, "Additional warning: We have run out of nice colours");
        expect(Object.values(plotColours)).to.contain("#999999")

        spy.restore();
    })
});
