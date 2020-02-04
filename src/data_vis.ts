import "bootstrap/dist/css/bootstrap.css";
import {Chart} from "chart.js";
import "chartjs-plugin-datalabels";
import {saveAs} from "file-saver";
import * as $ from "jquery";
import * as ko from "knockout";
import "select2/dist/css/select2.min.css";
import {appendToDataSet, DataSet, getDataSet} from "./AppendDataSets";
import {CustomChartOptions, impactChartConfig, timeSeriesChartConfig} from "./Chart";
import {TableMaker, WideTableRow} from "./CreateDataTable";
import {activityTypes, countries, countryGroups, dates, diseases, metricsAndOptions,
    reportInfo, supportTypes, touchstones, vaccines} from "./Data";
import {DataFilterer, DataFiltererOptions} from "./DataFilterer";
import {countryDict, diseaseDict, diseaseVaccineLookup, vaccineDict} from "./Dictionaries";
import {CountryFilter, DiseaseFilter, ListFilter, RangeFilter} from "./Filter";
import {filterHelp, generatedHelpBody, generatedHelpTitle, generatedMetricsHelp} from "./Help";
import {ImpactDataRow} from "./ImpactDataRow";
import {MetaDataDisplay} from "./MetaDataDisplay";
import {plotColours} from "./PlotColours";
import {WarningMessageManager} from "./WarningMessage";

// stuff to handle the data set being split into multiple files
let filePrefix: string = "Uninitialized filePrefix";
let initTouchstone: string = "Uninitialized initTouchstone";
let montaguDataSets: DataSet[] = [];
let initMethod: string = "Uninitialized initMethod";

if (metricsAndOptions.mode.includes("public")) {
  filePrefix = "firstPaper";
  initTouchstone = "1";
  initMethod = "cross";

  montaguDataSets = [
    { name : "year_of_vac", data : [], seen : [], selected: [] },
    { name : "cross", data : [], seen : [], selected: [] },
    { name : "cohort", data : [], seen : [], selected: [] },
  ];

  appendToDataSet(["1"], filePrefix, "cross", montaguDataSets, true);
  appendToDataSet(["1"], filePrefix, "cohort", montaguDataSets, true);
} else if (metricsAndOptions.mode.includes("private")) {
  filePrefix = "impactData";
  initTouchstone = "201710gavi-201907wue";
  initMethod = "year_of_vac";

  montaguDataSets = [
    { name : "year_of_vac", data : [], seen : [], selected: [] },
    { name : "cross", data : [], seen : [], selected: [] },
    { name : "cohort", data : [], seen : [], selected: [] },
  ];

  appendToDataSet(["201710gavi-201907wue"], filePrefix, "year_of_vac", montaguDataSets, true);
  appendToDataSet(["201710gavi"], filePrefix, "cross", montaguDataSets, true);
  appendToDataSet(["201710gavi"], filePrefix, "cohort", montaguDataSets, true);
}

require("./index.html");
require("./image/logo-dark-drop.png");
require("./image/caret-down.svg");
require("./image/caret-up.svg");
require("./image/caret-up-dark.svg");
require("./image/caret-up-secondary.svg");
require("./image/caret-down-secondary.svg");
require("./css/styles.css");
require("./select2Binding");

const jsonexport = require("jsonexport");

function createRangeArray(min: number = 1, max: number): number[] {
  const a: number[] = [];
  for (let i: number = min; i <= max; ++i) {
    a.push(i);
  }
  return a;
}

const createVaccineFilterForDisease = (d: string) => new ListFilter({
    name: d,
    options: diseaseVaccineLookup[d],
    humanNames: diseaseDict,
    selected: diseaseVaccineLookup[d].
      filter((x) => -1 !== ["Rota", "Rubella"].indexOf(x)),
  },
);

class DataVisModel {
  private plots = ko.observableArray(["Impact", "Time series"]);
  private permittedMetrics: { [key: string]: string[] } = {
    "Impact": metricsAndOptions.metrics,
    "Time series": metricsAndOptions.metrics,
  };
  private currentPlot = ko.observable("Impact");

  private isPrivate = ko.observable(metricsAndOptions.mode.includes("private"));

  private impactData = ko.observable(getDataSet(initMethod, montaguDataSets).data);
  private yearMethod = ko.observable(initMethod);

  private showYearOfVac =
    ko.observable(metricsAndOptions.methods.includes("year_of_vac"));
  private showCross =
    ko.observable(metricsAndOptions.methods.includes("cross"));
  private showCohort =
    ko.observable(metricsAndOptions.methods.includes("cohort"));
  private showUncertainty =
    ko.observable(metricsAndOptions.uiVisible.includes("uncertainty"));
  private showSidebar = ko.observable(true);

  private yearFilter = ko.observable(new RangeFilter({
    max: dates["max"][0],
    min: dates["min"][0],
    name: "Years",
    selectedHigh: 2018,
    selectedLow: 2000,
  }));

  private xAxisOptions =
         metricsAndOptions.dualOptions.concat(metricsAndOptions.stratOptions);

  private yAxisOptions = ko.computed(() => {
    const catOptions =
         metricsAndOptions.dualOptions.concat(metricsAndOptions.stratOptions);
    catOptions.push("none");
    switch (this.currentPlot()) {
      case "Impact":
        return catOptions;
      case "Time series":
        return catOptions.filter((v, i, a) => (v !== "year"));
      default:
        return catOptions;
    }
  }, this);

  private filterOptions =
    metricsAndOptions.dualOptions.concat(metricsAndOptions.filterOptions);

  private showYearFilter =
      ko.observable(this.filterOptions.includes("year"));

  private activityFilter = ko.observable(new ListFilter({
    name: "Activity",
    options: activityTypes,
  }));
  private showActivityFilter =
      ko.observable(this.filterOptions.includes("activity_type"));

  private countryFilter = ko.observable(new CountryFilter({
    groups: countryGroups,
    humanNames: countryDict,
    name: "Country",
    options: countries,
    selected: countryGroups["pine"],
  }));
  private showCountryFilter =
      ko.observable(this.filterOptions.includes("country"));

  private vaccineDiseaseFilter = ko.observable(new DiseaseFilter({
    name: "Disease",
    vaccineFilters: diseases.map(createVaccineFilterForDisease),
  }));
  private showVaccineFilter =
      ko.observable(this.filterOptions.includes("vaccine"));

  private diseaseFilter = ko.observable(new ListFilter({
    name: "Disease",
    options: diseases,
  }));
  private showDiseaseFilter =
      ko.observable(this.filterOptions.includes("disease"));

  private touchstoneFilter = ko.observable(new ListFilter({
    name: "Touchstone",
    options: touchstones,
    selected: [initTouchstone],
  }));
  private showTouchstoneFilter =
      ko.observable(this.filterOptions.includes("touchstone"));

  private supportFilter = ko.observable(new ListFilter({
    name: "Gavi support",
    humanNames: { gavi : "yes", other : "no" },
    options: supportTypes,
    selected: supportTypes.slice(0, 1),
  }));
  private showSupportFilter =
      ko.observable(this.filterOptions.includes("support_type"));

  private visbleMetricButtons = ko.observableArray<string>(metricsAndOptions.metrics);
  private showAgeGroupToggle = ko.observable<boolean>(metricsAndOptions.filterOptions.includes("age_group"));

  private maxPlotOptions = ko.observableArray<number>(createRangeArray(1, 20));
  private maxBars = ko.observable<number>(19);

  private xAxis = ko.observable<string>(this.xAxisOptions[1]);
  private yAxis = ko.observable<string>("disease");
  private cumulativePlot = ko.observable<boolean>(false);
  private ageGroup = ko.observable<string>("all");
  private uncertaintyChecked = ko.observable<boolean>(false);

  private reportId = ko.observable<string>("Report id: " + reportInfo.rep_id);
  // if we end up with more datasets move this to arrays of ko strings
  private dataId1 = ko.observable<string>(reportInfo.dep_id[0]);
  private dataId2 = ko.observable<string>(reportInfo.dep_id[1]);
  private dataLink1 = ko.observable<string>("https://montagu.vaccineimpact.org/reports/report/"
                        + reportInfo.dep_name[0] + "/"
                        + reportInfo.dep_id[0] + "/");
  private dataLink2 = ko.observable<string>("https://montagu.vaccineimpact.org/reports/report/"
                        + reportInfo.dep_name[1] + "/"
                        + reportInfo.dep_id[1] + "/");
  private linkText = ko.observable<string>("A report containing the data for the tool");
  private appId = ko.observable<string>("App. id: " + reportInfo.git_id);

  private hideLabels = ko.observable<boolean>(false);
  private hideLegend = ko.observable<boolean>(false);
  private hideTitleOpts = ko.observable<boolean>(false);

  private humanReadableBurdenOutcome = ko.observable("deaths_averted");

  private xAxisNames = ko.observableArray<string>([]);

  private canvas: any;
  private ctx: any;
  private chartObject: Chart;

  private canvasTS: any;
  private ctxTS: any;
  private chartObjectTS: Chart;

  private filteredTable: ko.ObservableArray<WideTableRow>;
  private filteredTSTable: ko.ObservableArray<WideTableRow>;

  // Modal Help Windows
  private modalHelpTitle
    = ko.computed<string>(() => generatedHelpTitle(this.currentPlot()));
  private modalHelpMain
    = ko.computed<string>(() => generatedHelpBody(this.currentPlot()));
  private modalFilterHelpMain
    = ko.observable(filterHelp);
  private modalMetricsHelpMain
    = ko.computed<string>(() => generatedMetricsHelp(this.currentPlot(),
                             this.visbleMetricButtons()));

  private burdenOutcome = ko.computed(() => {
    switch (this.humanReadableBurdenOutcome()) {
      case "deaths":
        return "deaths";
      case "deaths_averted":
        return "deaths_averted";
      case "cases":
        return "cases";
      case "cases_averted":
        return "cases_averted";
      case "dalys":
        return "dalys";
      case "dalys_averted":
        return "dalys_averted";
      case "fvps":
        return "fvps";
      case "coverage":
        this.cumulativePlot(false); // this might not be prefered behaviour, if a user goes deaths
        return "coverage";      // -> coverage -> death it will set cumulative to false
      case "deathsRate":
        this.cumulativePlot(false); // this might not be prefered behaviour, if a user goes deaths
        return "deaths_averted_rate";      // -> coverage -> death it will set cumulative to false
      case "casesRate":
        this.cumulativePlot(false); // this might not be prefered behaviour, if a user goes deaths
        return "cases_averted_rate";      // -> coverage -> death it will set cumulative to false
      default:
        this.cumulativePlot(false);
        return "deaths_averted";
    }
  }, this);

  private plotTitle = ko.observable(this.defaultTitle());

  private plotUncertainty = ko.computed<boolean>(() => {
    // in order to show uncertainty we must have...
    return ((this.uncertaintyChecked()) &&      // ...checked the option...
        (this.currentPlot() === "Time series") && // ...be on a time series...
        (this.yAxis() === "disease"));      // ...be stratifying by disease
  }, this);

  private yAxisTitle = ko.computed(() => {
    switch (this.humanReadableBurdenOutcome()) {
      case "deaths":
        return "Future deaths";
      case "deaths_averted":
        return "Future deaths averted";
      case "cases":
        return "Future cases averted";
      case "dalys":
        return "Future DALYs";
      case "dalys_averted":
        return "Future DALYS averted";
      case "fvps":
        return "fvps";
      case "coverage":
        return "Coverage";
      case "casesRate":
        return "Future cases averted (rate)";
      case "deathsRate":
        return "Future deaths averted (rate)";
      default:
        return "Future deaths averted";
    }
  }, this);

  private chartOptions = ko.computed<CustomChartOptions>(() => {
    return {
      activityTypes: this.activityFilter().selectedOptions(), // which vaccination strategies do we care about
      ageGroup: this.ageGroup(), //
      xAxis: this.xAxis(), // variable we are comparing across
      cumulative: this.cumulativePlot(), // are we creating a cumulative plot
      yAxis: this.yAxis(), // variable we are stratifying by
      hideLabels: this.hideLabels(),
      maxPlot: this.maxBars(), // How many bars on the plot
      metric: this.burdenOutcome(), // What outcome are we using e.g death, DALYs
      plotTitle: this.plotTitle(),
      plotType: this.currentPlot(),
      selectedCountries: this.countryFilter().selectedOptions(), // which countries do we care about
      selectedTouchstones: this.touchstoneFilter().selectedOptions(), // which touchstones do we care about
      selectedVaccines: this.vaccineDiseaseFilter().selectedOptions(), // which vaccines do we care about
      selectedDiseases: this.diseaseFilter().selectedOptions(),
      supportType: this.supportFilter().selectedOptions(),
      yAxisTitle: this.yAxisTitle(),
      yearHigh: this.yearFilter().selectedHigh(), // upper bound on yeat
      yearLow: this.yearFilter().selectedLow(), // lower bound on year
      plotUncertainity: this.plotUncertainty(),
    };
  }, this).extend({rateLimit: 250});

  private metaData = ko.computed<string>(() => {
    return MetaDataDisplay(this.chartOptions(), countryDict, vaccineDict);
  }, this);

  private warningMessage = ko.computed<string>(() => {
    const message = new WarningMessageManager().getError(this.chartOptions());
    return message;
  }, this);

  private showWarning = ko.computed<boolean>(() => {
    return this.warningMessage().length > 1;
  }, this);

  constructor() {
    // chartjs plots have a transparent background as default
    // this fills the background opaque white
    Chart.plugins.register({
      beforeDraw: (chartInstance: any) => {
        chartInstance.chart.ctx.fillStyle = "white";
        chartInstance.chart.ctx.fillRect(0, 0,
          chartInstance.chart.width, chartInstance.chart.height);
      },
    });

    this.canvas = document.getElementById("myChart");
    this.canvasTS = document.getElementById("timeSeriesChart");

    this.ctx = this.canvas.getContext("2d");
    this.ctxTS = this.canvasTS.getContext("2d");

    this.xAxis.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.yearFilter().selectedLow.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.yearFilter().selectedHigh.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.activityFilter().selectedOptions.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.countryFilter().selectedOptions.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.vaccineDiseaseFilter().selectedOptions.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.diseaseFilter().selectedOptions.subscribe(() => {
      this.updateXAxisOptions();
    });
    this.supportFilter().selectedOptions.subscribe(() => {
      this.updateXAxisOptions();
    });

    this.touchstoneFilter().selectedOptions.subscribe(() => {
      const appendTo: string = this.yearMethod();
      appendToDataSet(this.touchstoneFilter().selectedOptions(),
              filePrefix, appendTo, montaguDataSets);

      this.impactData(getDataSet(appendTo, montaguDataSets).data);
      this.updateXAxisOptions();
    });

    this.chartOptions.subscribe(() => {
      this.renderImpact();
      this.renderTimeSeries();
    });
  }

  public renderImpact() {
    const chartOptions: CustomChartOptions = this.chartOptions();

    if (chartOptions.plotType !== "Impact" || !this.ctx) {
      return;
    }

    if (this.chartObject) {
      this.chartObject.destroy();
    }

    let dict = null
    if (chartOptions.yAxis === "country") {
      dict = countryDict
    } else if (chartOptions.yAxis === "vaccine") {
      dict = vaccineDict
    }

    const filterData = new DataFilterer().filterData(chartOptions,
                             this.impactData(),
                             metricsAndOptions,
                             plotColours,
                             dict);
    const {datasets, xAxisVals} = filterData;

    let xAxisNames: string[] = [...xAxisVals];
    // when we put countries along convert the names to human readable
    if (chartOptions.xAxis === "country") {
      xAxisNames = xAxisNames.map((x) => countryDict[x]);
    }

    this.filteredTable = new TableMaker().createWideTable(datasets, xAxisNames);
    this.chartObject = new Chart(this.ctx, impactChartConfig(filterData, xAxisNames, chartOptions));
  }

  public renderTimeSeries() {
    const chartOptions: CustomChartOptions = this.chartOptions();

    if (chartOptions.plotType !== "Time series" || !this.ctxTS) {
      return;
    }

    if (this.chartObjectTS) {
      this.chartObjectTS.destroy();
    }

    let dict = null
    if (chartOptions.yAxis === "country") {
      dict = countryDict
    } else if (chartOptions.yAxis === "vaccine") {
      dict = vaccineDict
    }

    const filterData = new DataFilterer().filterData(chartOptions,
                             this.impactData(),
                             metricsAndOptions,
                             plotColours,
                             dict);
    const {datasets, xAxisVals} = filterData;

    this.filteredTSTable = new TableMaker().createWideTable(datasets, xAxisVals);
    this.chartObjectTS = new Chart(this.ctxTS,
                                   timeSeriesChartConfig(filterData,
                                                         xAxisVals,
                                                         chartOptions));
  }

  private selectPlot(plotName: string) {
    // need to make sure that the new new plot  is valid with current metric
    if (this.permittedMetrics[plotName].indexOf(this.burdenOutcome()) < 0) {
      // ...if not set it to deaths
      this.changeBurden("deaths_averted");
      // It might worth remember what the Burden was so we can restore it
      // when we naviaget back? TODO
    }

    this.currentPlot(plotName);
  }

  private exportPlot() {
    this.canvas = document.getElementById("myChart");
    this.canvas.toBlob((blob: Blob) => {
      saveAs(blob, "untitled.png");
    });
  }

  private exportData() {
    jsonexport(this.filteredTable(), (err: any, csv: any) => {
      if (err) {
        return; // probably do something else here
      }
      const blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "data.csv");
    });
  }

  private exportAllData() {
    const fileName: string = reportInfo.dep_id + "_data_set.zip";
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = "data_set.zip";
    a.download = fileName;
    a.click();
    document.body.removeChild(a);
  }

  private changeBurden(burden: string) {
    this.humanReadableBurdenOutcome(burden);
    this.plotTitle(this.defaultTitle());
  }

  private changeMethod(method: string) {
    const data: DataSet = getDataSet(method, montaguDataSets);
    this.impactData(data.data);
    this.yearMethod(method);
    this.touchstoneFilter().selectedOptions(data.selected);
  }

  private changeAgeGroup(ageGroup: string) {
    this.ageGroup(ageGroup);
  }

  private updateXAxisOptions() {
    // refilter the data
    const chartOptions = {...this.chartOptions(), maxPlot: -1};

    let dict = null
    if (chartOptions.yAxis === "country") {
      dict = countryDict
    } else if (chartOptions.yAxis === "vaccine") {
      dict = vaccineDict
    }

    const filteredData = new DataFilterer().filterData(chartOptions,
                               this.impactData(),
                               metricsAndOptions,
                               plotColours,
                               dict);
    this.xAxisNames(filteredData.xAxisVals);
    this.maxPlotOptions(createRangeArray(1, this.xAxisNames().length));
    this.maxBars(this.xAxisNames().length);
  }

  private defaultTitle() {
    switch (this.humanReadableBurdenOutcome()) {
      case "deaths":
        return "Future deaths averted between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      case "cases":
        return "Future cases averted between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      case "dalys":
        return "Future DALYS averted between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      case "fvps":
        return "fvps between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      case "coverage":
        return "Mean coverage between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      case "casesRate":
        return "Mean rate of cases averted between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      case "deathsRate":
        return "Mean rate of death averted between " + this.yearFilter().selectedLow() +
             " and " + this.yearFilter().selectedHigh();
      default:
        return "Future deaths averted";
    }
  }

  private resetTitle() {
    this.plotTitle(this.defaultTitle());
  }

  private applyTitle() {
    this.renderImpact();
  }

  private exportTSPlot() {
    this.canvasTS.toBlob((blob: Blob) => {
      saveAs(blob, "untitled.png");
    });
  }

  private exportTSData() {
    jsonexport(this.filteredTSTable(), (err: any, csv: any) => {
      if (err) {
        return; // probably do something else here
      }
      const blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "data.csv");
    });
  }

  private debug(message: string) {
    console.log(message);
  }
}

$(document).ready(() => {
  const viewModel = new DataVisModel();

  ko.applyBindings(viewModel);

  viewModel.renderImpact();
  viewModel.renderTimeSeries();
});
