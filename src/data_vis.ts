import {DataFilterer, DataFiltererOptions} from "./DataFilterer";
import {TableMaker} from "./CreateDataTable";

declare const impactData: ImpactDataRow[];
declare const reportInfo: any;
import {ImpactDataRow} from "./ImpactDataRow";
import {countryDict, vaccineDict, diseaseDict} from "./Dictionaries"
import {plotColours} from "./PlotColours"

require("./index.html");
require("./logo-dark-drop.png");
require("./caret-down.svg");
require("./caret-up.svg");
require("./caret-up-dark.svg");
require("./caret-up-secondary.svg");
require("./caret-down-secondary.svg");
require("./css/styles.css");
require("./css/bootstrap.css")

import * as ko from "knockout";
import {Chart} from "chart.js";
import "chartjs-plugin-datalabels"
import {saveAs} from "file-saver"
import {FilteredRow} from "./FilteredRow";
import {Filter, ListFilter, RangeFilter, CountryFilter} from "./Filter";
import {diseases, vaccines, countries, activityTypes, plottingVariables} from "./Data";
const jsonexport = require('jsonexport');
// const $  = require( 'jquery' );
// const dt = require( 'datatables.net' )( window, $ );

function rescaleLabel(value: number, scale: number): string {
    if (scale > 1000000000) {
        return value / 1000000000 + "B";
    }
    if (scale > 1000000) {
        return value / 1000000 + "M";
    }
    if (scale > 1000)  {
        return value / 1000 + "K";
    }
    return value.toString();
}

class DataVisModel {
    // UI knockout variables
    hideLabels:     KnockoutObservable<boolean>;
    hideLegend:     KnockoutObservable<boolean>;

    showSidebar = ko.observable(true);
    yearFilter = ko.observable(new RangeFilter({name: "Years", min: 2011, max: 2030, selectedLow: 2016, selectedHigh:2020}));
    activityFilter = ko.observable(new ListFilter({name: "Activity", options: activityTypes}));
    countryFilter = ko.observable(new CountryFilter({name: "Country", options: countries, humanNames: countryDict}));
    diseaseFilter = ko.observable(new ListFilter({name: "Disease", options: diseases, humanNames: diseaseDict}));
    vaccineFilter = ko.observable(new ListFilter({name: "Vaccine", options: vaccines, humanNames: vaccineDict}));

    // the  variable that we are going to compare along the x axis
    compareOptions: Array<string>;

    // the variable that we are going to disaggregate by
    disaggOptions:  Array<string>;
    maxPlotOptions: Array<number>;
    compare:        KnockoutObservable<string>;
    disagg:         KnockoutObservable<string>;
    maxBars:        KnockoutObservable<number>;
    cumPlot:        KnockoutObservable<boolean>;

    humanReadableBurdenOutcome: KnockoutObservable<string>;
    burdenOutcome:              KnockoutComputed<string>;
    plotTitle:                  KnockoutObservable<string>;
    yAxisTitle:                 KnockoutComputed<string>;

    // Touchstone
    activeTouchstone: KnockoutComputed<string>;
    //////////////////////////////////////////////////////////////////////////////
    // Id tracking info
    repId: KnockoutObservable<string>; // id of montagu report for app
    depId: KnockoutObservable<string>; // id of montagu report for data
    AppId: KnockoutObservable<string>; // git has of app source code

    canvas: any;
    ctx: any;
    chartObject: Chart;

    filteredTable: KnockoutObservableArray<any>;
    gridViewModel: any;

    countryCodeToName(countryCode: string) {
        return countryDict[countryCode];
    }

    render() {
        this.canvas = document.getElementById('myChart');
        this.ctx = this.canvas.getContext('2d');

        if (this.chartObject) {
            this.chartObject.destroy();
        }

        const filterOptions = {
            metric:            this.burdenOutcome(), // What outcome are we using e.g death, DALYs
            maxPlot:           this.maxBars(), // How many bars on the plot
            compare:           this.compare(), // variable we are comparing across
            disagg:            this.disagg(), // variable we are disaggregating by
            yearLow:           this.yearFilter().selectedLow(), // lower bound on year
            yearHigh:          this.yearFilter().selectedHigh(), // upper bound on yeat
            activityTypes:     this.activityFilter().selectedOptions(), // which vaccination strategies do we care about
            selectedCountries: this.countryFilter().selectedOptions(), // which countries do we care about
            selectedDiseases:  this.diseaseFilter().selectedOptions(), // which diseases do we care about
            selectedVaccines:  this.vaccineFilter().selectedOptions(), // which vaccines do we care about
            cumulative:        (this.compare() == "year" && this.cumPlot()) // are we creating a cumulative plot
        }

        const filterData = new DataFilterer().filterData(filterOptions, impactData, plotColours)

        const datasets = filterData[0];
        let compareNames: string[] = [...filterData[1]];
        const totals = filterData[2];
        // when we put countries along convert the names to human readable
        if (this.compare() == "country") {
            compareNames = compareNames.map(this.countryCodeToName)
        }

        const hideLabel: boolean = this.hideLabels();
        const maxTotal = Math.max(...totals);
        this.filteredTable = new TableMaker().createTable(datasets, compareNames);
        // Aborted attempt to render filteredTable as a DataTable
        // $(document).ready(function() {
        //     $('#example').DataTable( {
        //         data: this.filteredTable,
        //         columns: [
        //             { title: this.compare() },
        //             { title: this.disagg() },
        //             { title: this.humanReadableBurdenOutcome() }
        //         ]
        //     } );
        // } );

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
                    datalabels:{
                            color: "white",
                            display: function(context: any) {
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
                    onComplete: function() {
                        const chart = this.chart;
                        const context = chart.ctx;
                        const lastDataSet: number = datasets.length - 1
                        const lastMeta = chart.controller.getDatasetMeta(lastDataSet);
                        // this is a lot of nonsense to grab the plot meta data
                        // for the final (topmost) data set
                        lastMeta.data.forEach(function(bar: any, index: number) {
                            const data = rescaleLabel(totals[index].toPrecision(3),
                                                      totals[index].toPrecision(3));
                            // magic numbers to the labels look reasonable
                            context.fillText(data, bar._model.x - 12, bar._model.y - 5);
                        });
                    }
                }
            }
        });
    }

    exportPlot() {
        this.canvas = document.getElementById('myChart');
        this.canvas.toBlob(function(blob: Blob) {
            saveAs(blob, "untitled.png");
        });
    }

    exportData() {
        jsonexport(this.filteredTable(), function(err: any, csv: any) {
            if(err) {
                return; // probably do something else here
            }
            var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "data.csv");
        });
    }

    changeBurden(burden: string) {
        this.humanReadableBurdenOutcome(burden)
        this.plotTitle(this.defaultTitle());
    }

    defaultTitle() {
        switch(this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "Future deaths averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "cases":
                return "Future cases averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "dalys":
                return "Future DALYS averted between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            case "fvps":
                return "fvps between " + this.yearFilter().selectedLow() + " and " + this.yearFilter().selectedHigh()
            default:
                return "Future deaths averted"
        }
    }

    resetTitle() {
        this.plotTitle(this.defaultTitle());
    }

    applyTitle() {
        this.render();
    }

    constructor() {
        this.repId = ko.observable("Report id: " + reportInfo.rep_id);
        this.depId = ko.observable("Data id: " + reportInfo.dep_id);
        this.AppId = ko.observable("App. id: " + reportInfo.git_id);

        this.compareOptions = plottingVariables;
        this.disaggOptions = plottingVariables;

        this.maxPlotOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        this.compare = ko.observable(this.compareOptions[1]);
        this.disagg = ko.observable(this.disaggOptions[7]);

        this.maxBars = ko.observable(5);

        this.cumPlot = ko.observable(false);
        this.hideLabels = ko.observable(false);
        this.hideLegend = ko.observable(false);

        this.humanReadableBurdenOutcome = ko.observable("deaths");
        this.burdenOutcome = ko.computed(function() {
            switch(this.humanReadableBurdenOutcome()) {
                case "deaths":
                    return "deaths_averted"
                case "cases":
                    return "cases_averted"
                case "dalys":
                    return "dalys_averted"
                case "fvps":
                    return "fvps"
                default:
                    return "deaths_averted"
            }
        }, this);

        this.plotTitle = ko.observable(this.defaultTitle());

        this.yAxisTitle = ko.computed(function() {
            switch(this.humanReadableBurdenOutcome()) {
                case "deaths":
                    return "Future deaths averted"
                case "cases":
                    return "Future cases averted"
                case "dalys":
                    return "Future DALYS averted"
                case "fvps":
                    return "fvps"
                default:
                    return "Future deaths averted"
            }
        }, this);

        // initialise to pine countries selected
        this.countryFilter().selectCountryGroup("pine")
        this.render();
    };


}

ko.applyBindings(new DataVisModel());

