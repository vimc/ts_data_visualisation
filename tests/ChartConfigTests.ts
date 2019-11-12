import * as ut from "../src/Utils"
import * as sinon from "sinon";

import {touchstones} from "../scripts/fakeVariables";
import {ChartConfiguration} from "chart.js";
import {annotationHelper, dateToAnnotation, impactChartConfig,
        timeSeriesChartConfig, AnnotatedChartConfiguration,
        BaseAnnotation, CustomChartOptions} from "../src/Chart";
import {FilteredData} from "../src/DataFilterer";
import {expect} from "chai";

describe("ChartConfigs", () => {
  it("Check annotationHelper", () => {
    const conf: BaseAnnotation =
      annotationHelper("abc", 1066, "xyz");

    expect(conf.value).to.equal(1066);
    expect(conf.borderColor).to.equal("xyz");
    expect(conf.label.content).to.equal("abc");
  })

  it("Check dateToAnnotation", () => {
    const annos: BaseAnnotation[] =
      dateToAnnotation(touchstones);

    const t = annos.map((a) => { return a.label.content; })
    // make sure the touchstones we get out the annotations
    // are the same as the ones we passed in.
    expect(t).to.eql(touchstones);
  })

  it("Check impactChartConfig", () => {
    const c: CustomChartOptions
        = <CustomChartOptions>{
            activityTypes: ["at1", "at2"],
            xAxis: "cofinance_status_2018",
            cumulative: true,
            yAxis: "DIS",
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
    // filtered data is tested elsewhere
    const f: FilteredData = {datasets: [],
                             xAxisVals: [""],
                             totals: [0]};

    const config: ChartConfiguration =
      impactChartConfig(f, ["a", "b", "c"], c);

    expect(config.data.labels).to.eql(["a", "b", "c"]);
    expect(config.options.title.text).to.eql(c.plotTitle);
    expect(config.options.scales.yAxes[0].scaleLabel.labelString).
      to.eql(c.yAxisTitle)
  })

  it("Check timeSeriesChartConfig", () => {
    const c: CustomChartOptions
        = <CustomChartOptions>{
            activityTypes: ["at1", "at2"],
            xAxis: "cofinance_status_2018",
            cumulative: true,
            yAxis: "DIS",
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
    // filtered data is tested elsewhere
    const f: FilteredData = {datasets: [],
                             xAxisVals: [""],
                             totals: [0]};

    const config: AnnotatedChartConfiguration =
      timeSeriesChartConfig(f, ["a", "b", "c"], c);

    expect(config.data.labels).to.eql(["a", "b", "c"]);
    expect(config.options.title.text).to.eql(c.plotTitle);
    expect(config.options.scales.yAxes[0].scaleLabel.labelString).
      to.eql(c.yAxisTitle)
  })
});
