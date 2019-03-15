import {MetaDataDisplay} from "../src/MetaDataDisplay";
import {CustomChartOptions} from "../src/Chart";
import {expect} from "chai";


describe("MetaDataDisplay", () => {
    it("MetaDataDisplay", () => {
        // we don't do any error checking in MetaDataDisplay, so these fields can be gibberish
        const chartOptions: CustomChartOptions
            = <CustomChartOptions>{
                activityTypes: ["at1", "at2"],
                compare: "CMP",
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
        expect(md2).to.include("CMP");
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
    })
});