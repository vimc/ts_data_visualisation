import {WarningMessageManager} from "../src/WarningMessage";
import {DataFiltererOptions} from "../src/DataFilterer";
import {CustomChartOptions} from "../src/Chart";
import {expect} from "chai";

describe("WarningMessageManager", () => {
  const names: string[] = ["Cat", "Dog"];
  const dataset: any[] =  [{"label" : "Alfa",    "data" : [1, 9]},
                           {"label" : "Bravo",   "data" : [2, 8]},
                           {"label" : "Charlie", "data" : [3, 7]},
                           {"label" : "Delta",   "data" : [4, 6]},
                           {"label" : "Echo",    "data" : [5, 5]}];

  it("Bad Touchstones", () => {
        const chartOptions: CustomChartOptions
            = <CustomChartOptions>{
                activityTypes: ["at1", "at2"],
                compare: "cofinance_status_2018",
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
                yearHigh: 1666,
                yearLow: 1066,
    };

    const wmm: WarningMessageManager = new WarningMessageManager();
    const errmsg: string = wmm.getError(chartOptions);
    expect(errmsg).to.have.string("Multiple touchstones have been selected, Compare across should " +
                                  "be set to touchstone otherwise the data shown will be meaningless");

    chartOptions["compare"] = "touchstone";
    const errmsg_2: string = wmm.getError(chartOptions);
    expect(errmsg_2).to.have.string("");
  });

  it("Bad Years", () => {
        const chartOptions: CustomChartOptions
            = <CustomChartOptions>{
                activityTypes: ["at1", "at2"],
                compare: "cofinance_status_2018",
                cumulative: true,
                disagg: "DIS",
                hideLabels: false,
                maxPlot: 163,
                metric: "METRIC",
                plotTitle: "TITLE",
                plotType: "TYPE",
                selectedCountries: ["COD", "MMR"], 
                selectedTouchstones: ["ts1"],
                selectedVaccines: ["HepB", "HepB_BD", "Hib3", "HPV", "JE", "MCV1", "MCV2"],
                timeSeries: true,
                yAxisTitle: "AXIS TITLE",
                yearHigh: 1066,
                yearLow: 1666,
    };


    const wmm: WarningMessageManager = new WarningMessageManager();
    const errmsg: string = wmm.getError(chartOptions);
    expect(errmsg).to.have.string("Year low is after year high");
  });
})