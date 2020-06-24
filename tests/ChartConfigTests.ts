import * as ut from "../src/Utils"
import * as sinon from "sinon";

import {touchstones} from "../scripts/fakeVariables";
import {ChartConfiguration} from "chart.js";
import {annotationHelper, cleanMetric, dateToAnnotation, impactChartConfig,
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
      to.eql(c.yAxisTitle);

  });

  it("Check impactChartConfig bar totals labels", () => {
      const getTotalsLabels =  (yAxis: string) => {
          const chartOptions = {yAxis};
          const filterData = {
              datasets: [{}],
              totals: [10000, 20000, 30000],
          };

          const config = impactChartConfig(filterData as any, [], chartOptions as any);

          const bars = { data: [
              {_model: {x: 100, y: 200}},
              {_model: {x: 300, y: 400}},
              {_model: {x: 500, y: 600}},
           ] };
          const generatedLabels: any[] = [];
          const mockChart = {
              ctx: {
                  fillText: (text: string, x: number, y: number) => {
                      generatedLabels.push({text, x, y});
                  },
              },
              controller: {
                  getDatasetMeta: () => {
                      return bars;
                  },
              },
          };
          const func = config.options.animation.onComplete;
          func.call({chart: mockChart});
          return generatedLabels;
      };
      // Totals labels should not be generated for 'disease' or 'vaccine' only
      const labelsForDisease = getTotalsLabels("disease");
      expect(labelsForDisease.length).to.eq(0);
      const labelsForVaccine = getTotalsLabels("vaccine");
      expect(labelsForVaccine.length).to.eq(0);
      const labelsForCountry = getTotalsLabels("country");
      expect(labelsForCountry.length).to.eq(3);
      expect(labelsForCountry[0]).to.eql({text: "10K", x: 88, y: 195});
      expect(labelsForCountry[1]).to.eql({text: "20K", x: 288, y: 395});
      expect(labelsForCountry[2]).to.eql({text: "30K", x: 488, y: 595});
  });

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

describe("ChartConfigs", () => {
  expect(cleanMetric("deaths_averted")).to.eql("deaths averted");
  expect(cleanMetric("deaths_averted_rate")).to.eql("deaths averted rate");
  expect(cleanMetric("deaths")).to.eql("deaths");

  expect(cleanMetric("cases_averted")).to.eql("cases averted");
  expect(cleanMetric("cases_averted_rate")).to.eql("cases averted rate");
  expect(cleanMetric("cases")).to.eql("cases");

  expect(cleanMetric("dalys_averted")).to.eql("dalys averted");
  expect(cleanMetric("dalys_averted_rate")).to.eql("dalys averted rate");
  expect(cleanMetric("dalys")).to.eql("dalys");

  expect(cleanMetric("coverage")).to.eql("coverage");
  expect(cleanMetric("fvps")).to.eql("FVPs");

  expect(cleanMetric("BAD")).to.eql("Bad metric in cleanMetric");
});
