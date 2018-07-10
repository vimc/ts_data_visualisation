import {DataFilterer} from "./DataFilterer";
import {TableMaker} from "./CreateDataTable";

declare const impactData: ImpactDataRow[];
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
const jsonexport = require('jsonexport');
// const $  = require( 'jquery' );
// const dt = require( 'datatables.net' )( window, $ );

class Filter {
    isOpen: KnockoutObservable<boolean>;
    name: KnockoutObservable<string>

    toggleOpen() {
        this.isOpen(!this.isOpen());
    }

    constructor(name: string) {
        this.isOpen = ko.observable(false);
        this.name = ko.observable(name);
    }
}

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
    showSidebar:    KnockoutObservable<boolean>;
    yearFilter:     KnockoutObservable<Filter>;
    activityFilter: KnockoutObservable<Filter>;
    countryFilter:  KnockoutObservable<Filter>;
    diseaseFilter:  KnockoutObservable<Filter>;
    vaccineFilter:  KnockoutObservable<Filter>;
    hideLabels:     KnockoutObservable<boolean>;
    hideLegend:     KnockoutObservable<boolean>;

    // the  variable that we are going to compare along the x axis
    compareOptions: Array<string>;

    // the variable that we are going to disaggregate by
    disaggOptions:  Array<string>;
    maxPlotOptions: Array<number>;
    yearOptions:    Array<number>;
    compare:        KnockoutObservable<string>;
    disagg:         KnockoutObservable<string>;
    maxBars:        KnockoutObservable<number>;
    cumPlot:        KnockoutObservable<boolean>;
    yearLo:         KnockoutObservable<number>;
    yearHi:         KnockoutObservable<number>;

    humanReadableBurdenOutcome: KnockoutObservable<string>;
    burdenOutcome:              KnockoutComputed<string>;
    plotTitle:                  KnockoutObservable<string>;
    yAxisTitle:                 KnockoutComputed<string>;
    //////////////////////////////////////////////////////////////////////////////
    // Vaccination strategy
    vacStratOptions:   Array<string>;
    selectedVacStrats: KnockoutObservableArray<string>;
    //////////////////////////////////////////////////////////////////////////////
    // Countries!
    countryOptions:    Array<string>;
    selectedCountries: KnockoutObservableArray<string>;
    //////////////////////////////////////////////////////////////////////////////
    // Countries!
    vaccineOptions:    Array<string>;
    selectedVaccines:  KnockoutObservableArray<string>;
    //////////////////////////////////////////////////////////////////////////////
    // Countries!
    diseaseOptions:    Array<string>;
    selectedDiseases:  KnockoutObservableArray<string>;
    //////////////////////////////////////////////////////////////////////////////
    // Touchstone
    activeTouchstone: KnockoutComputed<string>;

    canvas: any;
    ctx: any;
    chartObject: Chart;

    filteredTable: KnockoutObservableArray<any>;
    gridViewModel: any;

    deaths: Array<number>;

    selectCountryGroup(cntGrp: string) {
        switch(cntGrp) {
            case "all":
                this.selectedCountries(this.countryOptions);
                break;
            case "none":
                this.selectedCountries([]);
                break;
            case "pine":
                this.selectedCountries(["IND", "PAK", "NGA", "ETH"]);
                break;
            case "gavi73":
                this.selectedCountries(["AFG", "AGO", "ARM", "AZE", "BDI", "BEN", "BFA", "BGD", "BOL", "BTN", "CAF",
                    "CIV", "CMR", "COD", "COG", "COM", "CUB", "DJI", "ERI", "ETH", "GEO", "GHA", "GIN", "GMB", "GNB",
                    "GUY", "HND", "HTI", "IDN", "IND", "KEN", "KGZ", "KHM", "KIR", "LAO", "LBR", "LKA", "LSO", "MDA",
                    "MDG", "MLI", "MMR", "MNG", "MOZ", "MRT", "MWI", "NER", "NGA", "NIC", "NPL", "PAK", "PNG", "PRK",
                    "RWA", "SDN", "SEN", "SLB", "SLE", "SOM", "SSD", "STP", "TCD", "TGO", "TJK", "TLS", "TZA", "UGA",
                    "UKR", "UZB", "VNM", "YEM", "ZMB", "ZWE"]);
                break;
            case "gavi69":
                this.selectedCountries(["AFG", "AGO", "ARM", "AZE", "BDI", "BEN", "BFA", "BGD", "BOL", "BTN", "CAF",
                    "CIV", "CMR", "COD", "COG", "COM", "CUB", "DJI", "ERI", "GEO", "GHA", "GIN", "GMB", "GNB",
                    "GUY", "HND", "HTI", "IDN", "KEN", "KGZ", "KHM", "KIR", "LAO", "LBR", "LKA", "LSO", "MDA",
                    "MDG", "MLI", "MMR", "MNG", "MOZ", "MRT", "MWI", "NER", "NIC", "NPL", "PNG", "PRK",
                    "RWA", "SDN", "SEN", "SLB", "SLE", "SOM", "SSD", "STP", "TCD", "TGO", "TJK", "TLS", "TZA", "UGA",
                    "UKR", "UZB", "VNM", "YEM", "ZMB", "ZWE"]);
                break;
            default:
                console.debug(cntGrp);
                this.selectedCountries([]);
                break;
        }
    }

    countryCodeToName(countryCode: string) {
        return countryDict[countryCode];
    }

    diseaseCodeToDisease(diseaseCode: string) {
        return diseaseDict[diseaseCode];
    }

    vaccineCodeToVaccine(vaccineCode: string) {
        return vaccineDict[vaccineCode];
    }

    render() {
        this.canvas = document.getElementById('myChart');
        this.ctx = this.canvas.getContext('2d');

        if (this.chartObject) {
            this.chartObject.destroy();
        }

        // do we want to produce a cumulative plot
        const cumulative = (this.compare() == "year" && this.cumPlot())

        const filterData = new DataFilterer().filterData(this.burdenOutcome(),    // What outcome are we using e.g death, DALYs
                                                         this.maxBars(),          // How many bars on the plot
                                                         this.compare(),          // variable we are comparing across
                                                         this.disagg(),           // variable we are disaggregating by
                                                         this.yearLo(),           // lower bound on year
                                                         this.yearHi(),           // upper bound on yeat
                                                         this.selectedVacStrats(),// which vaccination strategies do we care about
                                                         this.selectedCountries(),// which countries do we care about
                                                         this.selectedDiseases(), // which diseases do we care about
                                                         this.selectedVaccines(), // which vaccines do we care about
                                                         cumulative,              // are we creating a cumulative plot
                                                         impactData,              // the data set
                                                         plotColours);            // the colours used in the plot

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
                return "Future deaths averted between " + this.yearLo() + " and " + this.yearHi()
            case "cases":
                return "Future cases averted between " + this.yearLo() + " and " + this.yearHi()
            case "dalys":
                return "Future DALYS averted between " + this.yearLo() + " and " + this.yearHi()
            case "fvps":
                return "Future fvps between " + this.yearLo() + " and " + this.yearHi()
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
        this.showSidebar = ko.observable(true);
        this.yearFilter = ko.observable(new Filter("Years"));
        this.activityFilter = ko.observable(new Filter("Activity"));
        this.countryFilter = ko.observable(new Filter("Country"));
        this.diseaseFilter = ko.observable(new Filter("Disease"));
        this.vaccineFilter = ko.observable(new Filter("Vaccine"));

        this.compareOptions = ["year", "country", "continent", "region", "gavi_cofin_status", "activity_type",
                               "disease", "vaccine"];
        this.disaggOptions = ["year", "country", "continent", "region", "gavi_cofin_status", "activity_type",
                              "disease", "vaccine"];

        this.maxPlotOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

        this.yearOptions = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
                            2021, 2022, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2030];

        // the data for South Sudan (SSD), Palestinian Territories (PSE) and Kosovo (XK) are dodgy so I've omitted them
        this.countryOptions = ["AFG", "AGO", "ALB", "ARM", "AZE", "BDI", "BEN", "BFA", "BGD", "BIH", "BLZ", "BOL", "BTN",
                              "CAF", "CHN", "CIV", "CMR", "COD", "COG", "COM", "CPV", "CUB", "DJI", "EGY", "ERI", "ETH",
                              "FJI", "FSM", "GEO", "GHA", "GIN", "GMB", "GNB", "GTM", "GUY", "HND", "HTI", "IDN", "IND",
                              "IRQ", "KEN", "KGZ", "KHM", "KIR", "LAO", "LBR", "LKA", "LSO", "MAR", "MDA", "MDG", "MHL",
                              "MLI", "MMR", "MNG", "MOZ", "MRT", "MWI", "NER", "NGA", "NIC", "NPL", "PAK", "PHL", "PNG",
                              "PRK", "PRY", /*"PSE",*/ "RWA", "SDN", "SEN", "SLB", "SLE", "SLV", "SOM", /*"SSD",*/ "STP", "SWZ",
                              "SYR", "TCD", "TGO", "TJK", "TKM", "TLS", "TON", "TUV", "TZA", "UGA", "UKR", "UZB", "VNM",
                              "VUT", "WSM", /*"XK",*/ "YEM", "ZMB", "ZWE"]
        this.selectedCountries = ko.observableArray(["IND", "PAK", "NGA", "ETH"]);

        this.vaccineOptions = ["HepB", "HepB_BD", "Hib3", "HPV", "JE", "MCV1",
                               "MCV2", "Measles", "MenA", "PCV3", "Rota",
                               "RCV2", "Rubella", "YF"];
        this.selectedVaccines = ko.observableArray(this.vaccineOptions);

        this.diseaseOptions = ["HepB", "Hib", "HPV", "JE", "Measles", "MenA",
                               "PCV", "Rota", "Rubella", "YF"];
        this.selectedDiseases = ko.observableArray(this.diseaseOptions);


        this.yearLo = ko.observable(2016);
        this.yearHi = ko.observable(2020);

        this.compare = ko.observable(this.compareOptions[1]);
        this.disagg = ko.observable(this.disaggOptions[7]);

        this.maxBars = ko.observable(5);

        this.cumPlot = ko.observable(false);
        this.hideLabels = ko.observable(false);
        this.hideLegend = ko.observable(false);

        this.vacStratOptions = ["routine", "campaign"];
        this.selectedVacStrats = ko.observableArray(this.vacStratOptions);

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
                    return "Future fvps"
                default:
                    return "Future deaths averted"
            }
        }, this);

        // initialise to pine countries selected
        this.selectCountryGroup("pine")
        this.render();
    };


}

ko.applyBindings(new DataVisModel());

