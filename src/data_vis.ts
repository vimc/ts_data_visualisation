import {DataFilterer, DataFiltererOptions} from "./DataFilterer";
import {TableMaker} from "./CreateDataTable";
import {ImpactDataRow} from "./ImpactDataRow";
import {WarningMessageManager} from "./WarningMessage"
import {countryDict, diseaseDict, vaccineDict} from "./Dictionaries"
import {plotColours} from "./PlotColours"
import * as ko from "knockout";
import {Chart} from "chart.js";
import * as L from "leaflet";
import "chartjs-plugin-datalabels"
import {saveAs} from "file-saver"
import {CountryFilter, ListFilter, RangeFilter} from "./Filter";
import {diseases, vaccines, countries, activityTypes, plottingVariables, touchstones} from "./Data";
import 'bootstrap/dist/css/bootstrap.css';
import {CustomChartOptions, impactChartConfig, timeSeriesChartConfig} from "./Chart";

// stuff to handle the data set being split into multiple files
const initTouchstone: string = "201710gavi-201807wue";
import {dataSetUpdate, appendToDataSet} from "./AppendDataSets"
export let addedDataSets: string[] = [];
const update = appendToDataSet([initTouchstone], addedDataSets, []);
addedDataSets = update.newSeenList;
//export let splitData = update.newDataSet;
export let impactData = update.newDataSet;

//declare const impactData: ImpactDataRow[];
declare const reportInfo: any;

require("./index.html");
require("./image/logo-dark-drop.png");
require("./image/caret-down.svg");
require("./image/caret-up.svg");
require("./image/caret-up-dark.svg");
require("./image/caret-up-secondary.svg");
require("./image/caret-down-secondary.svg");
require("./css/styles.css");

const $ = require("jquery");

const jsonexport = require('jsonexport');

function createRangeArray(min: number = 1, max: number): number[] {
    let a: number[] = [];
    for (let i: number = min; i <= max; ++i) {
        a.push(i);
    }
    return a;
}

class DataVisModel {
    plots = ko.observableArray(["Impact", "Time series"]);
    currentPlot = ko.observable("Impact");

    selectPlot(plotName: string) {
        this.currentPlot(plotName)
    };

    showSidebar = ko.observable(true);
    yearFilter = ko.observable(new RangeFilter({
        name: "Years",
        min: 2011,
        max: 2030,
        selectedLow: 2016,
        selectedHigh: 2020
    }));
    activityFilter = ko.observable(new ListFilter({
        name: "Activity",
        options: activityTypes
    }));
    countryFilter = ko.observable(new CountryFilter({
        name: "Country",
        options: countries,
        humanNames: countryDict
    }));
    diseaseFilter = ko.observable(new ListFilter({
        name: "Disease",
        options: diseases,
        humanNames: diseaseDict
    }));
    vaccineFilter = ko.observable(new ListFilter({
        name: "Vaccine",
        options: vaccines,
        humanNames: vaccineDict
    }));
    touchstoneFilter = ko.observable(new ListFilter({
        name: "Touchstone",
        options: touchstones,
        selected: ["201710gavi-201807wue"]
    }));

    xAxisOptions = plottingVariables;
    disaggregationOptions = plottingVariables;

    maxPlotOptions = ko.observableArray<number>(createRangeArray(1, 20));
    maxBars = ko.observable<number>(5);

    compare = ko.observable<string>(this.xAxisOptions[1]);
    disaggregateBy = ko.observable<string>("disease");
    cumulativePlot = ko.observable<boolean>(false);

    reportId = ko.observable<string>("Report id: " + reportInfo.rep_id);
    dataId = ko.observable<string>("Data id: " + reportInfo.dep_id);
    appId = ko.observable<string>("App. id: " + reportInfo.git_id);

    hideLabels = ko.observable<boolean>(false);
    hideLegend = ko.observable<boolean>(false);
    hideTitleOpts = ko.observable<boolean>(false);

    humanReadableBurdenOutcome = ko.observable("deaths");

    compareNames = ko.observableArray<string>([]);

    canvas: any;
    ctx: any;
    chartObject: Chart;

    canvasTS: any;
    ctxTS: any;
    chartObjectTS: Chart;

    /*    mymap: any;*/

    filteredTable: KnockoutObservableArray<any>;
    gridViewModel: any;
    filteredTSTable: KnockoutObservableArray<any>;

    constructor() {

        this.canvas = document.getElementById('myChart');
        this.canvasTS = document.getElementById('timeSeriesChart');

        this.ctx = this.canvas.getContext('2d');
        this.ctxTS = this.canvasTS.getContext('2d');

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
            const update: dataSetUpdate =
                appendToDataSet(this.touchstoneFilter().selectedOptions(),
                                addedDataSets, impactData);
            addedDataSets = update.newSeenList;
            impactData = update.newDataSet;
            this.updateXAxisOptions();
        });

        this.chartOptions.subscribe(() => {
            this.renderImpact();
            this.renderTimeSeries();
        })

    }

    countryCodeToName(countryCode: string) {
        return countryDict[countryCode];
    };

    exportPlot() {
        this.canvas = document.getElementById('myChart');
        this.canvas.toBlob(function (blob: Blob) {
            saveAs(blob, "untitled.png");
        });
    };

    exportData() {
        jsonexport(this.filteredTable(), function (err: any, csv: any) {
            if (err) {
                return; // probably do something else here
            }
            var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "data.csv");
        });
    };

    changeBurden(burden: string) {
        this.humanReadableBurdenOutcome(burden);
        this.plotTitle(this.defaultTitle());
    };

    updateXAxisOptions() {
        // we have to it this way because javascript doesn't copy object on
        // assignmnet!
        let chartOptions = $.extend(true,{},this.chartOptions());
        chartOptions.maxPlot = -1;
        // refilter the data
        const filteredData = new DataFilterer().filterData(chartOptions, impactData, plotColours);
        this.compareNames(filteredData.compVars);
        this.maxPlotOptions(createRangeArray(1, this.compareNames().length));
        this.maxBars(this.compareNames().length);
    }

    defaultTitle() {
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "Future deaths averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "cases":
                return "Future cases averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "dalys":
                return "Future DALYS averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "fvps":
                return "fvps between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "coverage":
                return "Mean coverage between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "casesRate":
                return "Mean rate of cases averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "deathsRate":
                return "Mean rate of death averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            default:
                return "Future deaths averted"
        }
    }

    resetTitle() {
        this.plotTitle(this.defaultTitle());
    }

    applyTitle() {
        this.renderImpact();
    }

    burdenOutcome = ko.computed(() => {
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "deaths_averted"
            case "cases":
                return "cases_averted"
            case "dalys":
                return "dalys_averted"
            case "fvps":
                return "fvps"
            case "coverage":
                this.cumulativePlot(false); // this might not be prefered
                return "coverage"           // behaviour, if a user goes deaths
            case "casesRate":               // -> coverage -> death it will set
                this.cumulativePlot(false); // cumulative to false
                return "cases_averted_rate"
            case "deathsRate":
                this.cumulativePlot(false);
                return "deaths_averted_rate"
            default:
                this.cumulativePlot(false);
                return "deaths_averted"
        }
    }, this);

    plotTitle = ko.observable(this.defaultTitle());

    yAxisTitle = ko.computed(() => {
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
                return "Coverage"
            case "casesRate":
                return "Future cases averted (rate)"
            case "deathsRate":
                return "Future deaths averted (rate)"
            default:
                return "Future deaths averted"
        }
    }, this);

    chartOptions = ko.computed<CustomChartOptions>(() => {
        return {
            currentPlot: this.currentPlot(),
            metric: this.burdenOutcome(), // What outcome are we using e.g death, DALYs
            maxPlot: this.maxBars(), // How many bars on the plot
            compare: this.compare(), // variable we are comparing across
            disagg: this.disaggregateBy(), // variable we are disaggregating by
            yearLow: this.yearFilter().selectedLow(), // lower bound on year
            yearHigh: this.yearFilter().selectedHigh(), // upper bound on yeat
            activityTypes: this.activityFilter().selectedOptions(), // which vaccination strategies do we care about
            selectedCountries: this.countryFilter().selectedOptions(), // which countries do we care about
            selectedDiseases: this.diseaseFilter().selectedOptions(), // which diseases do we care about
            selectedVaccines: this.vaccineFilter().selectedOptions(), // which vaccines do we care about
            selectedTouchstones: this.touchstoneFilter().selectedOptions(), // which touchstones do we care about
            cumulative: this.cumulativePlot(), // are we creating a cumulative plot
            timeSeries: this.currentPlot() == "Time series",
            yAxisTitle: this.yAxisTitle(),
            plotTitle: this.plotTitle(),
            hideLabels: this.hideLabels()
        }

    }, this).extend({rateLimit: 250});

    warningMessage = ko.computed<string>(function() {
        const message = new WarningMessageManager().getError(this.chartOptions());
        return message;
    }, this);

    showWarning = ko.computed<boolean>(function() {
        return this.warningMessage().length > 1;
    }, this);

    renderImpact() {
        const chartOptions: CustomChartOptions = this.chartOptions();

        if (chartOptions.currentPlot != "Impact" || !this.ctx) {
            return;
        }

        if (this.chartObject) {
            this.chartObject.destroy();
        }

        const filterData = new DataFilterer().filterData(chartOptions, impactData, plotColours);
        const {datasets, compVars} = filterData;

        let compareNames: string[] = [...compVars];
        // when we put countries along convert the names to human readable
        if (chartOptions.compare == "country") {
            compareNames = compareNames.map(this.countryCodeToName)
        }

        this.filteredTable = new TableMaker().createWideTable(datasets, compareNames);
        this.chartObject = new Chart(this.ctx, impactChartConfig(filterData, compareNames, chartOptions));

    };

    renderTimeSeries() {
        const chartOptions: CustomChartOptions = this.chartOptions();

        if (chartOptions.currentPlot != "Time series" || !this.ctxTS) {
            return;
        }

        if (this.chartObjectTS) {
            this.chartObjectTS.destroy();
        }

        const filterData = new DataFilterer().calculateMean(chartOptions, impactData, plotColours);
        const {datasets, compVars_top} = filterData;

        this.filteredTSTable = new TableMaker().createWideTable(datasets, compVars_top);
        this.chartObjectTS = new Chart(this.ctxTS, timeSeriesChartConfig(filterData, compVars_top, chartOptions));

    };

    exportTSPlot() {
        this.canvasTS.toBlob(function (blob: Blob) {
            saveAs(blob, "untitled.png");
        });
    }

    exportTSData() {
        jsonexport(this.filteredTSTable(), function (err: any, csv: any) {
            if (err) {
                return; // probably do something else here
            }
            var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "data.csv");
        });
    }

    /*    renderMap() {
           this.mymap = L.map('mapid').setView([51.505, -0.09], 13);

            L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png',
                {
                    attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
                      maxZoom: 17,
                      minZoom: 9
                }).addTo(this.mymap);
            }*/
}

$(document).ready(() => {
    const viewModel = new DataVisModel();

    ko.applyBindings(viewModel);

    viewModel.renderImpact();
    viewModel.renderTimeSeries();
    //  viewModel.renderMap();
});
