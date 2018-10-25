import {DataFilterer} from "./DataFilterer";
import {TableMaker} from "./CreateDataTable";
import {ImpactDataRow} from "./ImpactDataRow";
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

declare const impactData: ImpactDataRow[];
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

function rescaleLabel(value: number, scale: number): string {
    if (scale > 1000000000) {
        return value / 1000000000 + "B";
    }
    if (scale > 1000000) {
        return value / 1000000 + "M";
    }
    if (scale > 1000) {
        return value / 1000 + "K";
    }
    return value.toString();
}

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
        options: activityTypes}));
    countryFilter = ko.observable(new CountryFilter({
        name: "Country",
        options: countries,
        humanNames: countryDict}));
    diseaseFilter = ko.observable(new ListFilter({
        name: "Disease",
        options: diseases,
        humanNames: diseaseDict}));
    vaccineFilter = ko.observable(new ListFilter({
        name: "Vaccine",
        options: vaccines,
        humanNames: vaccineDict}));
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

    reportId = ko.observable("Report id: " + reportInfo.rep_id);
    dataId = ko.observable("Data id: " + reportInfo.dep_id);
    appId = ko.observable("App. id: " + reportInfo.git_id);

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
        this.currentPlot.subscribe(function() {
            if (this.currentPlot() == "Impact") {
                this.renderImpact();
            } else if (this.currentPlot() == "Time series") {
                this.renderTimeSeries();
            }
        }, this)
        this.compare.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.disaggregateBy.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.cumulativePlot.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.maxBars.subscribe(function() {
            this.onUIChange(true, false); // this has to be false to prevent infinite regression
        }, this)
        this.yearFilter().selectedLow.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.yearFilter().selectedHigh.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.activityFilter().selectedOptions.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.countryFilter().selectedOptions.subscribe(function() {;
            this.onUIChange(true, true);
        }, this)
        this.diseaseFilter().selectedOptions.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.vaccineFilter().selectedOptions.subscribe(function() {
            this.onUIChange(true, true);
        }, this)
        this.touchstoneFilter().selectedOptions.subscribe(function() {
            this.onUIChange(true, true);
        }, this)

        this.compareNames.subscribe(function() {
            this.maxPlotOptions(createRangeArray(1, this.compareNames().length));
            this.maxBars(this.compareNames().length);
        }, this)
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
        this.humanReadableBurdenOutcome(burden)
        this.plotTitle(this.defaultTitle());
        this.onUIChange(true, true);
    };

    onUIChange(redraw: boolean, updateUI: boolean) {
        const isTimeSeries: boolean = (this.currentPlot() == "Time series");
        if (updateUI) {
            // refilter the data
            const filterOptions = {
                metric: this.burdenOutcome(),
                maxPlot: -1,
                compare: this.compare(),
                disagg: this.disaggregateBy(),
                yearLow: this.yearFilter().selectedLow(),
                yearHigh: this.yearFilter().selectedHigh(),
                activityTypes: this.activityFilter().selectedOptions(),
                selectedCountries: this.countryFilter().selectedOptions(),
                selectedDiseases: this.diseaseFilter().selectedOptions(),
                selectedVaccines: this.vaccineFilter().selectedOptions(),
                selectedTouchstones: this.touchstoneFilter().selectedOptions(),
                cumulative: (this.compare() == "year" && this.cumulativePlot()),
                timeSeries: isTimeSeries
            };

            const filteredData = new DataFilterer().filterData(filterOptions, impactData, plotColours);
            this.compareNames([...filteredData[1]]);
        }

        if (redraw) {
            if (isTimeSeries) {
                this.renderTimeSeries();
            } else {
                this.renderImpact();
            }
        }
    };


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

    burdenOutcome = ko.computed(function () {
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
                return "coverage"
            case "casesRate":
                return "cases_averted_rate"
            case "deathsRate":
                return "deaths_averted_rate"
            default:
                return "deaths_averted"
        }
    }, this);

    plotTitle = ko.observable(this.defaultTitle());

    yAxisTitle = ko.computed(function () {
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

    renderImpact() {
        this.canvas = document.getElementById('myChart');
        this.ctx = this.canvas.getContext('2d');

        if (this.chartObject) {
            this.chartObject.destroy();
        }

        const filterOptions = {
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
            cumulative: (this.compare() == "year" && this.cumulativePlot()), // are we creating a cumulative plot
            timeSeries: false
        };

        const filterData = new DataFilterer().filterData(filterOptions, impactData, plotColours);

        const datasets = filterData[0];
        let compareNames: string[] = [...filterData[1]];
        const totals = filterData[2];
        // when we put countries along convert the names to human readable
        if (this.compare() == "country") {
            compareNames = compareNames.map(this.countryCodeToName)
        }

        const hideLabel: boolean = this.hideLabels();
        const maxTotal = Math.max(...totals);
        this.filteredTable = new TableMaker().createWideTable(datasets, compareNames);
        this.chartObject = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: compareNames,
                datasets: datasets,
            },
            options: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: this.plotTitle(),
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: this.yAxisTitle(),
                        },
                        stacked: true,
                        ticks: {
                            callback: (value, index, values) => rescaleLabel(value, value)
                        }
                    }]
                },
                plugins: {
                    datalabels: {
                        color: "white",
                        display: function (context: any) {
                            if (!hideLabel)
                                return context.dataset.data[context.dataIndex] > maxTotal / 10;
                            else
                                return false;
                        },
                        font: {
                            weight: "bold"
                        },
                        formatter: (value: number, ctx: any) => rescaleLabel(value, maxTotal)
                    }
                },
                animation: {
                    onComplete: function () {
                        const chart = this.chart;
                        const context = chart.ctx;
                        const lastDataSet: number = datasets.length - 1
                        if (lastDataSet > -1) {
                            const lastMeta = chart.controller.getDatasetMeta(lastDataSet);
                            // this is a lot of nonsense to grab the plot meta data
                            // for the final (topmost) data set
                            lastMeta.data.forEach(function (bar: any, index: number) {
                                const data = rescaleLabel(totals[index],
                                    totals[index]);
                                // magic numbers to the labels look reasonable
                                context.fillText(data, bar._model.x - 12, bar._model.y - 5);
                            });
                        }
                    }
                }
            }
        });
    }

    renderTimeSeries() {
        this.canvasTS = document.getElementById('timeSeriesChart');
        this.ctxTS = this.canvasTS.getContext('2d');

        if (this.chartObjectTS) {
            this.chartObjectTS.destroy();
        }

        const filterOptions = {
            metric: this.burdenOutcome(), // What outcome are we using e.g death, DALYs
            maxPlot: -1, // How many bars on the plot
            compare: "year",
            disagg: this.disaggregateBy(), // variable we are disaggregating by
            yearLow: this.yearFilter().selectedLow(), // lower bound on year
            yearHigh: this.yearFilter().selectedHigh(), // upper bound on yeat
            activityTypes: this.activityFilter().selectedOptions(), // which vaccination strategies do we care about
            selectedCountries: this.countryFilter().selectedOptions(), // which countries do we care about
            selectedDiseases: this.diseaseFilter().selectedOptions(), // which diseases do we care about
            selectedVaccines: this.vaccineFilter().selectedOptions(), // which vaccines do we care about
            selectedTouchstones: this.touchstoneFilter().selectedOptions(), // which touchstones do we care about
            cumulative: (this.cumulativePlot()), // are we creating a cumulative plot
            timeSeries: true
        };

        //const filterData = new DataFilterer().filterData(filterOptions, impactData, plotColours);

        const filterData = new DataFilterer().calculateMean(filterOptions, impactData, plotColours);

        const datasets = filterData[0];
        let compareNames: string[] = [...filterData[1]];

        this.filteredTSTable = new TableMaker().createWideTable(datasets, compareNames);

        this.chartObjectTS = new Chart(this.ctxTS, {
            type: 'line',
            data: {
                labels: compareNames,
                datasets: datasets,
            },
            options: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: this.plotTitle(),
                },
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
            },
        });
    }

    exportTSPlot() {
        this.canvas = document.getElementById('timeSeriesChart');
        this.canvas.toBlob(function (blob: Blob) {
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

const viewModel = new DataVisModel();

ko.applyBindings(viewModel);

$(document).ready(() => {
    viewModel.renderImpact();
    viewModel.renderTimeSeries();
    //  viewModel.renderMap();
});
