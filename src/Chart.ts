import {DataFiltererOptions, FilteredData, MeanData, DataFilterer} from "./DataFilterer";
import {Chart, ChartConfiguration} from "chart.js";
import {touchstoneYears} from "./Dictionaries"
import {plotColours} from "./PlotColours"

export interface CustomChartOptions extends DataFiltererOptions {
    plotTitle: string;
    yAxisTitle: string;
    currentPlot: string;
    hideLabels: boolean;
}

function rescaleLabel(value: number, scale: number): string {
    // we need to round down to three significant figures
    const df = new DataFilterer();
    if (scale > 1000000000) {
        return df.roundDown(value, 3) / 1000000000 + "B";
    }
    if (scale > 1000000) {
        return df.roundDown(value, 3) / 1000000 + "M";
    }
    if (scale > 1000) {
        return df.roundDown(value, 3) / 1000 + "K";
    }
    if (scale > 1) { // round values in [1, 1000] down to nearest integer
        return Math.floor(value) + "";
    } // i don't think rounding x in (0,1) is a good idea need to think about this
    return value.toString();
};

// At some point need to write a typedef for the return class
function annotationHelper(touchstone: string, year: number, colour: string): any {
    const a =   {
                    drawTime: "afterDatasetsDraw",
                    type: "line",
                    mode: "vertical",
                    scaleID: "x-axis-0",
                    value: year,
                    borderWidth: 2,
                    borderColor: colour,
                    label: {
                        content: touchstone,
                        enabled: true,
                        position: "top"
                            }
                };
    return a;
}

function dateToAnnotation(touchstones: string[]): any[] {
    const anno = touchstones.map( function(tch: string) :any {
                    return annotationHelper(tch, touchstoneYears[tch],
                                            plotColours[tch]);
                });

    return anno;
}

export function impactChartConfig(filterData: FilteredData,
                                  compareNames: string[],
                                  chartOptions: CustomChartOptions): ChartConfiguration {

    const {totals, datasets} = filterData;

    const maxTotal = Math.max(...totals);

    return  {
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
                text: chartOptions.plotTitle,
            },
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: chartOptions.yAxisTitle,
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
                        if (!chartOptions.hideLabels)
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
                    const lastDataSet: number = datasets.length - 1;
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
    };
}
// this should return a ChartConfiguration object but that doesn't have the
// annotation entry. So I've set it to any until I work out how to modify
// ChartConfiguration in a way that doesn't break everything!
export function timeSeriesChartConfig(filterData: MeanData,
                                      compareNames: string[],
                                      chartOptions: CustomChartOptions): any {
    const anno: any[] = dateToAnnotation(chartOptions.selectedTouchstones);
    console.log(anno)

    return {
        type: 'line',
        data: {
            labels: compareNames,
            datasets: filterData.datasets,
        },
        options: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: chartOptions.plotTitle,
            },
            plugins: {
                datalabels: {
                    display: false
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: chartOptions.yAxisTitle,
                    },
                    ticks: {
                        callback: (value: number, index: number, values: number[]) => rescaleLabel(value, value),
                        beginAtZero: true
                    }
                }]
            },
            annotation: {
                annotations: anno
            }
        },
    };
}