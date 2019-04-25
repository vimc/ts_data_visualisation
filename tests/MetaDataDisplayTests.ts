import {MetaDataDisplay, toPlural} from "../src/MetaDataDisplay";
import {CustomChartOptions} from "../src/Chart";
import {expect} from "chai";


describe("MetaDataDisplay", () => {
    it("Check meta data", () => {
        // we don't do any error checking in MetaDataDisplay, so these fields can be gibberish
        const chartOptions: CustomChartOptions
            = <CustomChartOptions>{
                activityTypes: ["at1", "at2"],
                xAxis: "cofinance_status_2018",
                cumulative: true,
                disagg: "DIS",
                hideLabels: false,
                maxPlot: 163,
                metric: "METRIC",
                plotTitle: "TITLE",
                plotType: "TYPE",
                selectedCountries: ["COD", "MMR"], 
                selectedTouchstones: ["ts1", "ts2", "ts3", "ts4", "ts5", "ts6"],
                selectedVaccines: ["HepB", "HepB_BD", "Hib3", "HPV", "JE", "MCV1", "MCV2"],
                timeSeries: true,
                yAxisTitle: "AXIS TITLE",
                yearHigh: 1066,
                yearLow: 2525,
            };
        const md1 = MetaDataDisplay(chartOptions);
        expect(md1).to.be.a("string");
        expect(md1).to.include("ERROR!");

        chartOptions["plotType"] = "Impact";
        const md2 = MetaDataDisplay(chartOptions);
        expect(md2).to.be.a("string");
        expect(md2).to.include("This plot shows the");
        expect(md2).to.include("METRIC");
        expect(md2).to.include("DIS");
        expect(md2).to.include("cofinance statuses");
        expect(md2).to.include("1066");
        expect(md2).to.include("2525");
        expect(md2).to.include("6 touchstones");
        expect(md2).to.include("ts2");
        expect(md2).to.include("7 vaccines");
        expect(md2).to.include("Hepatitis B");
        expect(md2).to.include("DR Congo");
        expect(md2).to.include("Myanmar");
        expect(md2).to.include("At2");
        expect(md2).to.include("163");

        chartOptions["plotType"] = "Time series";
        chartOptions["xAxis"] = "country";
        chartOptions["maxPlot"] = 1;
        chartOptions['selectedCountries'] = ["FJI", "GMB", "GEO", "GHA", "GTM", "GIN", "GNB", "GUY", "HTI", "HND", "IND"];
        chartOptions['selectedTouchstones'] = ["ts1", "ts2"];
        chartOptions['selectedVaccines'] = ["HepB", "HepB_BD"];
        const md3 = MetaDataDisplay(chartOptions);
        expect(md3).to.be.a("string");
        expect(md3).to.include("This plot shows the");
        expect(md2).to.include("METRIC");
        expect(md3).to.include("DIS");
        expect(md3).to.include("1066");
        expect(md2).to.include("2525");
        expect(md3).to.include("Touchstones");
        expect(md3).to.include("ts2");
        expect(md3).to.include("Vaccines");
        expect(md3).to.include("Hepatitis B");
        expect(md3).to.include("Gambia");
        expect(md3).to.include("Ghana");
        expect(md3).to.include("At2");
        expect(md3).to.include("1");
    })
});

describe("MetaDataDisplay", () => {
    it("Check meta data", () => {
        expect(toPlural("year", true)).to.equal("years");
        expect(toPlural("continent", true)).to.equal("continents");
        expect(toPlural("region", true)).to.equal("regions");
        expect(toPlural("disease", true)).to.equal("diseases");
        expect(toPlural("vaccine", true)).to.equal("vaccines");
        expect(toPlural("touchstone", true)).to.equal("touchstones");

        expect(toPlural("year", false)).to.equal("year");
        expect(toPlural("continent", false)).to.equal("continent");
        expect(toPlural("region", false)).to.equal("region");
        expect(toPlural("disease", false)).to.equal("disease");
        expect(toPlural("vaccine", false)).to.equal("vaccine");
        expect(toPlural("touchstone", false)).to.equal("touchstone");

        expect(toPlural("country", true)).to.equal("countries");
        expect(toPlural("country", false)).to.equal("country");

        expect(toPlural("cofinance_status_2018", true)).to.equal("cofinance statuses");
        expect(toPlural("cofinance_status_2018", false)).to.equal("cofinance status");

        expect(toPlural("activity_type", true)).to.equal("activity types");
        expect(toPlural("activity_type", false)).to.equal("activity type");

        expect(toPlural("Fish", true)).to.equal("ERROR!");
        expect(toPlural("Fish", false)).to.equal("ERROR!");
    })
});