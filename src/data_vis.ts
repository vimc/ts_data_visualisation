import "bootstrap/dist/css/bootstrap.css";
import {Chart} from "chart.js";
import "chartjs-plugin-datalabels";
import {saveAs} from "file-saver";
import * as $ from "jquery";
import * as ko from "knockout";
import * as L from "leaflet";
import {appendToDataSet, DataSetUpdate} from "./AppendDataSets";
import {CustomChartOptions, impactChartConfig, timeSeriesChartConfig} from "./Chart";
import {TableMaker} from "./CreateDataTable";
import {activityTypes, countries, diseases, plottingVariables, touchstones, vaccines} from "./Data";
import {DataFilterer, DataFiltererOptions} from "./DataFilterer";
import {countryDict, diseaseDict, vaccineDict} from "./Dictionaries";
import {CountryFilter, ListFilter, RangeFilter} from "./Filter";
import {ImpactDataRow} from "./ImpactDataRow";
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

const jsonexport = require("jsonexport");

function createRangeArray(min: number = 1, max: number): number[] {
    const a: number[] = [];
    for (let i: number = min; i <= max; ++i) {
        a.push(i);
    }
    return a;
}

class DataVisModel {
    private plots = ko.observableArray(["Impact", "Time series"]);
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

    private diseaseFilter = ko.observable(new ListFilter({
        humanNames: diseaseDict,
        name: "Disease",
        options: diseases,
    }));

    private vaccineFilter = ko.observable(new ListFilter({
        humanNames: vaccineDict,
        name: "Vaccine",
        options: vaccines,
    }));

    private touchstoneFilter = ko.observable(new ListFilter({
        name: "Touchstone",
        options: touchstones,
        selected: [initTouchstone],
    }));

    private xAxisOptions = plottingVariables;
    private disaggregationOptions = plottingVariables;

    private maxPlotOptions = ko.observableArray<number>(createRangeArray(1, 20));
    private maxBars = ko.observable<number>(5);

    private compare = ko.observable<string>(this.xAxisOptions[1]);
    private disaggregateBy = ko.observable<string>("disease");
    private cumulativePlot = ko.observable<boolean>(false);

    private reportId = ko.observable<string>("Report id: " + reportInfo.rep_id);
    private dataId = ko.observable<string>("Data id: " + reportInfo.dep_id);
    private appId = ko.observable<string>("App. id: " + reportInfo.git_id);

    private hideLabels = ko.observable<boolean>(false);
    private hideLegend = ko.observable<boolean>(false);
    private hideTitleOpts = ko.observable<boolean>(false);

    private humanReadableBurdenOutcome = ko.observable("deaths");

    private compareNames = ko.observableArray<string>([]);

    private canvas: any;
    private ctx: any;
    private chartObject: Chart;

    private canvasTS: any;
    private ctxTS: any;
    private chartObjectTS: Chart;

    private filteredTable: KnockoutObservableArray<any>;
    private gridViewModel: any;
    private filteredTSTable: KnockoutObservableArray<any>;

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
            compare: this.compare(), // variable we are comparing across
            cumulative: this.cumulativePlot(), // are we creating a cumulative plot
            currentPlot: this.currentPlot(),
            disagg: this.disaggregateBy(), // variable we are disaggregating by
            hideLabels: this.hideLabels(),
            maxPlot: this.maxBars(), // How many bars on the plot
            metric: this.burdenOutcome(), // What outcome are we using e.g death, DALYs
            plotTitle: this.plotTitle(),
            selectedCountries: this.countryFilter().selectedOptions(), // which countries do we care about
            selectedDiseases: this.diseaseFilter().selectedOptions(), // which diseases do we care about
            selectedTouchstones: this.touchstoneFilter().selectedOptions(), // which touchstones do we care about
            selectedVaccines: this.vaccineFilter().selectedOptions(), // which vaccines do we care about
            timeSeries: this.currentPlot() === "Time series",
            yAxisTitle: this.yAxisTitle(),
            yearHigh: this.yearFilter().selectedHigh(), // upper bound on yeat
            yearLow: this.yearFilter().selectedLow(), // lower bound on year
        };
    }, this).extend({rateLimit: 250});

    private warningMessage = ko.computed<string>(function() {
        const message = new WarningMessageManager().getError(this.chartOptions());
        return message;
    }, this);

    private showWarning = ko.computed<boolean>(function() {
        return this.warningMessage().length > 1;
    }, this);

    constructor() {

        this.canvas = document.getElementById("myChart");
        this.canvasTS = document.getElementById("timeSeriesChart");

        this.ctx = this.canvas.getContext("2d");
        this.ctxTS = this.canvasTS.getContext("2d");

        this.compare.subscribe(() => {
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
        this.vaccineFilter().selectedOptions.subscribe(() => {
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

        if (chartOptions.currentPlot !== "Impact" || !this.ctx) {
            return;
        }

        if (this.chartObject) {
            this.chartObject.destroy();
        }

        const filterData = new DataFilterer().filterData(chartOptions, impactData, plotColours);
        const {datasets, compVars} = filterData;

        let compareNames: string[] = [...compVars];
        // when we put countries along convert the names to human readable
        if (chartOptions.compare === "country") {
            compareNames = compareNames.map(this.countryCodeToName);
        }

        this.filteredTable = new TableMaker().createWideTable(datasets, compareNames);
        this.chartObject = new Chart(this.ctx, impactChartConfig(filterData, compareNames, chartOptions));
    }

    public renderTimeSeries() {
        const chartOptions: CustomChartOptions = this.chartOptions();

        if (chartOptions.currentPlot !== "Time series" || !this.ctxTS) {
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
        // we have to it this way because javascript doesn't copy object on
        // assignmnet!
        const chartOptions = $.extend(true, {}, this.chartOptions());
        chartOptions.maxPlot = -1;
        // refilter the data
        const filteredData = new DataFilterer().filterData(chartOptions, impactData, plotColours);
        this.compareNames(filteredData.compVars);
        this.maxPlotOptions(createRangeArray(1, this.compareNames().length));
        this.maxBars(this.compareNames().length);
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
