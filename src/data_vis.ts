import "bootstrap/dist/css/bootstrap.css";
import {Chart} from "chart.js";
import "chartjs-plugin-datalabels";
import {saveAs} from "file-saver";
import * as $ from "jquery";
import * as ko from "knockout";
import "select2/dist/css/select2.min.css";
import {appendToDataSet, DataSetUpdate} from "./AppendDataSets";
import {CustomChartOptions, impactChartConfig, timeSeriesChartConfig} from "./Chart";
import {TableMaker, WideTableRow} from "./CreateDataTable";
import {activityTypes, countries, diseases, plottingVariables, supportTypes, touchstones, vaccines} from "./Data";
import {DataFilterer, DataFiltererOptions} from "./DataFilterer";
import {countryCodeToName, countryDict, diseaseDict, diseaseVaccineLookup, vaccineDict} from "./Dictionaries";
import {CountryFilter, DiseaseFilter, ListFilter, RangeFilter} from "./Filter";
import {ImpactDataRow} from "./ImpactDataRow";
import {MetaDataDisplay} from "./MetaDataDisplay";
import {plotColours} from "./PlotColours";
import {WarningMessageManager} from "./WarningMessage";

// stuff to handle the data set being split into multiple files
const initTouchstone: string = "201710gavi-201807wue";
export let addedDataSets: string[] = [];
const update = appendToDataSet([initTouchstone], addedDataSets, []);
addedDataSets = update.newSeenList;
export let impactData = update.newDataSet;

declare const reportInfo: any;

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
    },
);

class DataVisModel {
    private plots = ko.observableArray(["Impact", "Time series"]);
    private permittedMetrics: { [key: string]: string[] } = {
        "Impact": ["deaths_averted", "dalys_averted", "cases_averted", "fvps"],
        "Time series": ["deaths_averted", "dalys_averted", "cases_averted",
                        "fvps", "deaths_averted_rate", "cases_averted_rate",
                        "coverage" ],
    };
    private currentPlot = ko.observable("Impact");

    private showSidebar = ko.observable(true);
    private yearFilter = ko.observable(new RangeFilter({
        max: 2030,
        min: 2011,
        name: "Years",
        selectedHigh: 2020,
        selectedLow: 2016,
    }));

    private activityFilter = ko.observable(new ListFilter({
        name: "Activity",
        options: activityTypes,
    }));

    private countryFilter = ko.observable(new CountryFilter({
        humanNames: countryDict,
        name: "Country",
        options: countries,
    }));

    private diseaseFilter = ko.observable(new DiseaseFilter({
        name: "Disease",
        vaccineFilters: diseases.map(createVaccineFilterForDisease),
    }));

    private touchstoneFilter = ko.observable(new ListFilter({
        name: "Touchstone",
        options: touchstones,
        selected: [initTouchstone],
    }));

    private supportFilter = ko.observable(new ListFilter({
        name: "Support type",
        options: supportTypes,
        selected: ["gavi"],
    }));

    private xAxisOptions = plottingVariables;
    private disaggregationOptions = ko.computed(() => {
        switch (this.currentPlot()) {
            case "Impact":
                return plottingVariables;
            case "Time series":
                return plottingVariables.filter((v, i, a) => (v !== "year"));
            default:
                return plottingVariables;
        }
    }, this);

    private maxPlotOptions = ko.observableArray<number>(createRangeArray(1, 20));
    private maxBars = ko.observable<number>(5);

    private xAxis = ko.observable<string>(this.xAxisOptions[1]);
    private disaggregateBy = ko.observable<string>("disease");
    private cumulativePlot = ko.observable<boolean>(false);

    private reportId = ko.observable<string>("Report id: " + reportInfo.rep_id);
    private dataId = ko.observable<string>("Data id: " + reportInfo.dep_id);
    private appId = ko.observable<string>("App. id: " + reportInfo.git_id);

    private hideLabels = ko.observable<boolean>(false);
    private hideLegend = ko.observable<boolean>(false);
    private hideTitleOpts = ko.observable<boolean>(false);

    private humanReadableBurdenOutcome = ko.observable("deaths");

    private xAxisNames = ko.observableArray<string>([]);

    private canvas: any;
    private ctx: any;
    private chartObject: Chart;

    private canvasTS: any;
    private ctxTS: any;
    private chartObjectTS: Chart;

    private filteredTable: KnockoutObservableArray<WideTableRow>;
    private filteredTSTable: KnockoutObservableArray<WideTableRow>;

    private burdenOutcome = ko.computed(() => {
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "deaths_averted";
            case "cases":
                return "cases_averted";
            case "dalys":
                return "dalys_averted";
            case "fvps":
                return "fvps";
            case "coverage":
                this.cumulativePlot(false); // this might not be prefered
                return "coverage";          // behaviour, if a user goes deaths
            case "casesRate":               // -> coverage -> death it will set
                this.cumulativePlot(false); // cumulative to false
                return "cases_averted_rate";
            case "deathsRate":
                this.cumulativePlot(false);
                return "deaths_averted_rate";
            default:
                this.cumulativePlot(false);
                return "deaths_averted";
        }
    }, this);

    private plotTitle = ko.observable(this.defaultTitle());

    private yAxisTitle = ko.computed(() => {
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "Future deaths averted";
            case "cases":
                return "Future cases averted";
            case "dalys":
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
            xAxis: this.xAxis(), // variable we are comparing across
            cumulative: this.cumulativePlot(), // are we creating a cumulative plot
            disagg: this.disaggregateBy(), // variable we are disaggregating by
            hideLabels: this.hideLabels(),
            maxPlot: this.maxBars(), // How many bars on the plot
            metric: this.burdenOutcome(), // What outcome are we using e.g death, DALYs
            plotTitle: this.plotTitle(),
            plotType: this.currentPlot(),
            selectedCountries: this.countryFilter().selectedOptions(), // which countries do we care about
            selectedTouchstones: this.touchstoneFilter().selectedOptions(), // which touchstones do we care about
            selectedVaccines: this.diseaseFilter().selectedOptions(), // which vaccines do we care about
            supportType: this.supportFilter().selectedOptions(),
            timeSeries: this.currentPlot() === "Time series",
            yAxisTitle: this.yAxisTitle(),
            yearHigh: this.yearFilter().selectedHigh(), // upper bound on yeat
            yearLow: this.yearFilter().selectedLow(), // lower bound on year
        };
    }, this).extend({rateLimit: 250});

    private metaData = ko.computed<string>(() => {
        return MetaDataDisplay(this.chartOptions());
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
        this.diseaseFilter().selectedOptions.subscribe(() => {
            this.updateXAxisOptions();
        });
        this.supportFilter().selectedOptions.subscribe(() => {
            this.updateXAxisOptions();
        });

        this.touchstoneFilter().selectedOptions.subscribe(() => {
            const newUpdate: DataSetUpdate =
                appendToDataSet(this.touchstoneFilter().selectedOptions(),
                                addedDataSets, impactData);
            addedDataSets = newUpdate.newSeenList;
            impactData = newUpdate.newDataSet;
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

        const filterData = new DataFilterer().filterData(chartOptions, impactData, plotColours);
        const {datasets, xAxisVals} = filterData;

        let xAxisNames: string[] = [...xAxisVals];
        // when we put countries along convert the names to human readable
        if (chartOptions.xAxis === "country") {
            xAxisNames = xAxisNames.map(countryCodeToName);
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

        const filterData = new DataFilterer().calculateMean(chartOptions, impactData, plotColours);
        const {datasets, compVarsTop} = filterData;

        this.filteredTSTable = new TableMaker().createWideTable(datasets, compVarsTop);
        this.chartObjectTS = new Chart(this.ctxTS, timeSeriesChartConfig(filterData, compVarsTop, chartOptions));
    }

    private selectPlot(plotName: string) {
        // need to make sure that the new new plot  is valid with current metric
        if (this.permittedMetrics[plotName].indexOf(this.burdenOutcome()) < 0) {
            // ...if not set it to deaths
            this.changeBurden("deaths");
            // It might worth remember what the Burden was so we can restore it
            // when we naviaget back? TODO
        }

        this.currentPlot(plotName);
    }

    private countryCodeToName(countryCode: string) {
        return countryDict[countryCode];
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

    private changeBurden(burden: string) {
        this.humanReadableBurdenOutcome(burden);
        this.plotTitle(this.defaultTitle());
    }

    private updateXAxisOptions() {
        // refilter the data
        const chartOptions = {...this.chartOptions(), maxPlot: -1};
        const filteredData = new DataFilterer().filterData(chartOptions, impactData, plotColours);
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
}

$(document).ready(() => {
    const viewModel = new DataVisModel();

    ko.applyBindings(viewModel);

    viewModel.renderImpact();
    viewModel.renderTimeSeries();
});
