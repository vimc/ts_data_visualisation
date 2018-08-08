import {Sidebar} from "./Sidebar";
import * as ko from "knockout";
import {Chart} from "chart.js";
import {saveAs} from "file-saver";
import {DataFilterer} from "../filtering/DataFilterer";
import {ImpactDataRow} from "../filtering/ImpactDataRow";
import {countryDict} from "../data/Dictionaries";
import {plotColours} from "../PlotColours";
import {TableMaker} from "../CreateDataTable";

declare const impactData: ImpactDataRow[];

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

export class Plot {

    sidebar: Sidebar;

    constructor(sidebar: Sidebar) {
        this.sidebar = sidebar;
        this.plotTitle(this.defaultTitle());
    }

    dataFilterer = new DataFilterer();
    tableMaker = new TableMaker();

    xAxisOptions = ["year", "country", "continent", "region", "gavi_cofin_status", "activity_type",
        "disease", "vaccine"];

    disaggregationOptions = ["year", "country", "continent", "region", "gavi_cofin_status", "activity_type",
        "disease", "vaccine"];

    maxBars = ko.observable<number>(20);

    compare = ko.observable<string>(this.xAxisOptions[1]);
    disaggregateBy = ko.observable<string>(this.disaggregationOptions[7]);
    numberOfBars = ko.observable<number>(5);
    cumulativePlot = ko.observable<boolean>(false);

    hideLabels = ko.observable<boolean>(false);
    hideLegend = ko.observable<boolean>(false);

    humanReadableBurdenOutcome = ko.observable("deaths");

    chartObject: Chart;

    filteredTable: KnockoutObservableArray<any>;
    gridViewModel: any;

    exportPlot() {
        const canvas = <HTMLCanvasElement>document.getElementById('myChart');
        canvas.toBlob(function (blob: Blob) {
            saveAs(blob, "untitled.png");
        });
    }

    exportData() {
        jsonexport(this.filteredTable(), function (err: any, csv: any) {
            if (err) {
                return; // probably do something else here
            }
            var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "data.csv");
        });
    }

    changeBurden(burden: string) {
        this.humanReadableBurdenOutcome(burden);
        this.plotTitle(this.defaultTitle());
    }

    defaultTitle() {
        const timeframe = this.sidebar.yearFilter().selectedLow() + " and " + this.sidebar.yearFilter().selectedHigh();
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return `Future deaths averted between ${timeframe}`;
            case "cases":
                return `Future cases averted between ${timeframe}`;
            case "dalys":
                return `Future DALYS averted between ${timeframe}`;
            case "fvps":
                return `fvps between ${timeframe}`;
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

    burdenOutcome = ko.computed(function () {
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "deaths_averted";
            case "cases":
                return "cases_averted";
            case "dalys":
                return "dalys_averted";
            case "fvps":
                return "fvps";
            default:
                return "deaths_averted"
        }
    }, this);

    plotTitle = ko.observable<string>("");

    yAxisTitle = ko.computed(function () {
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        switch (this.humanReadableBurdenOutcome()) {
            case "deaths":
                return "Future deaths averted";
            case "cases":
                return "Future cases averted";
            case "dalys":
                return "Future DALYS averted";
            case "fvps":
                return "fvps";
            default:
                return "Future deaths averted"
        }
    }, this);


    render() {
        const canvas = <HTMLCanvasElement>document.getElementById('myChart');
        const ctx = canvas.getContext('2d');

        if (this.chartObject) {
            this.chartObject.destroy();
        }

        const filterOptions = {
            metric: this.burdenOutcome(), // What outcome are we using e.g death, DALYs
            maxPlot: this.maxBars(), // How many bars on the plot
            compare: this.compare(), // variable we are comparing across
            disagg: this.disaggregateBy(), // variable we are disaggregating by
            yearLow: this.sidebar.yearFilter().selectedLow(), // lower bound on year
            yearHigh: this.sidebar.yearFilter().selectedHigh(), // upper bound on yeat
            activityTypes: this.sidebar.activityFilter().selectedOptions(), // which vaccination strategies do we care about
            selectedCountries: this.sidebar.countryFilter().selectedOptions(), // which countries do we care about
            selectedDiseases: this.sidebar.diseaseFilter().selectedOptions(), // which diseases do we care about
            selectedVaccines: this.sidebar.vaccineFilter().selectedOptions(), // which vaccines do we care about
            cumulative: (this.compare() == "year" && this.cumulativePlot()) // are we creating a cumulative plot
        };

        const filterData = this.dataFilterer.filterData(filterOptions, impactData, plotColours)

        const datasets = filterData[0];
        let xAxisLabels: string[] = [...filterData[1]];
        const totals = filterData[2];
        // when we put countries along convert the names to human readable
        if (this.compare() == "country") {
            xAxisLabels = xAxisLabels.map((code) => {
                return countryDict[code]
            })
        }

        const hideLabel: boolean = this.hideLabels();
        const maxTotal = Math.max(...totals);
        this.filteredTable = this.tableMaker.createTable(datasets, xAxisLabels);
        this.chartObject = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: xAxisLabels,
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
                        const lastMeta = chart.controller.getDatasetMeta(lastDataSet);
                        // this is a lot of nonsense to grab the plot meta data
                        // for the final (topmost) data set
                        lastMeta.data.forEach(function (bar: any, index: number) {
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
}