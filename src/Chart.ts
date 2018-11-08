import {DataFiltererOptions, FilteredData, MeanData} from "./DataFilterer";
import {Chart, ChartConfiguration} from "chart.js";

export interface CustomChartOptions extends DataFiltererOptions {
    plotTitle: string;
    yAxisTitle: string;
    currentPlot: string;
    hideLabels: boolean;
}

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

export function timeSeriesChartConfig(filterData: MeanData,
                                      compareNames: string[],
                                      chartOptions: CustomChartOptions): ChartConfiguration {
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
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
        },
    };
}