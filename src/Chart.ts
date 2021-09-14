/**
  * Functions in this file are mostly just helper functions for the chartjs
  * plotting
  */

import {Chart, ChartConfiguration, ChartOptions} from "chart.js";
import {DataFilterer, DataFiltererOptions, FilteredData} from "./DataFilterer";
import {plotColours} from "./PlotColours";


/**
  * For various UI reasons we need to know which years a touchstone ends on.
  * That is what this is. This probably should be read in from a source file - 
  * but we already have too many so I hard coded it here.
  *
  */
export const touchstoneYears: { [code: string]: number} = {
  "201210gavi-201303gavi" : 2011,
  "201210gavi-201810gavi" : 2017,
  "201310gavi"            : 2012,
  "201310gavi-201403gavi" : 2012,
  "201310gavi-201810gavi" : 2017,
  "201510gavi"            : 2014,
  "201510gavi-201810gavi" : 2017,
  "201710gavi"            : 2016,
  "201710gavi-201810gavi" : 2017,
};

export interface CustomChartOptions extends DataFiltererOptions {
  plotTitle: string;
  yAxisTitle: string;
  hideLabels: boolean;
}

export interface ChartOptionsWithAnnotation extends ChartOptions {
  annotation: any;
}

export interface AnnotatedChartConfiguration extends ChartConfiguration {
  options: ChartOptionsWithAnnotation;
}

export function rescaleLabel(value: string | number, scale: string | number): string {
  const numValue: number = typeof(value) === "string" ? parseFloat(value) : value;
  const numScale: number = typeof(scale) === "string" ? parseFloat(scale) : scale;
  // we need to round down to three significant figures
  const df = new DataFilterer();
  if (numScale > 1000000000) {
    return df.roundDown(numValue, 3) / 1000000000 + "B";
  }
  if (numScale > 1000000) {
    return df.roundDown(numValue, 3) / 1000000 + "M";
  }
  if (numScale > 1000) {
    return df.roundDown(numValue, 3) / 1000 + "K";
  }
  if (numScale > 1) { // round values in [1, 1000] down to nearest integer
    return Math.floor(numValue) + "";
  } // i don't think rounding x in (0,1) is a good idea need to think about this
  return numValue.toString();
}

export interface BaseAnnotation {
  drawTime: string;
  type: string;
  mode: string;
  scaleID: string;
  value: number;
  borderWidth: number;
  borderColor: string;
  label: {
    content: string;
    enabled: boolean;
    position: string;
  };
}

export function annotationHelper(touchstone: string, year: number, colour: string): BaseAnnotation {
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
            position: "top",
              },
        };
  return a;
}

export function cleanMetric(metric: string): string {
  switch (metric) {
    case "deaths_averted":
      return("deaths averted");
    case "deaths_averted_rate":
      return("deaths averted rate");
    case "deaths":
      return("deaths");

    case "cases_averted":
      return("cases averted");
    case "cases_averted_rate":
      return("cases averted rate");
    case "cases":
      return("cases");

    case "dalys_averted_rate":
      return("dalys averted rate");
    case "dalys_averted":
      return("dalys averted");
    case "dalys":
      return("dalys");

    case "coverage":
      return("coverage");
    case "fvps":
      return("FVPs");

    default:
      return("Bad metric in cleanMetric");
  }
}

export function dateToAnnotation(touchstones: string[]): BaseAnnotation[] {
  const anno = touchstones.map( (tch: string): BaseAnnotation => {
          return annotationHelper(tch, touchstoneYears[tch],
                      plotColours[tch]);
        });
  return anno;
}

export function impactChartConfig(filterData: FilteredData,
                                  compareNames: string[],
                                  chartOptions: CustomChartOptions): ChartConfiguration {
  const ds = filterData.datasets;
  const totals = filterData.totals;

  const maxTotal = Math.max(...totals);

  return  {
    type: "bar",
    data: {
      labels: compareNames,
      datasets: ds,
    },
    options: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: chartOptions.plotTitle,
      },
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: chartOptions.yAxisTitle,
          },
          stacked: true,
          ticks: {
            min: 0,
            callback: (value, index, values) => rescaleLabel(value, value)
          },
        }],
      },
      plugins: {
        datalabels: {
          color: "white",
          display: (context: any) => {
            if (!chartOptions.hideLabels) {
              return context.dataset.data[context.dataIndex] > maxTotal / 10;
            } else {
              return false;
            }
          },
          font: {
            weight: "bold",
          },
          formatter: (value: number, ctx: any) => rescaleLabel(value, maxTotal),
        },
      },
      animation: {
        // this has to be a methodName() and not a () => or else it breaks chart.js!
        onComplete() {
          const chart = this.chart;
          const context = chart.ctx;
          const lastDataSet: number = ds.length - 1;
          const showBarTotals = ["disease", "vaccine"].indexOf(chartOptions.yAxis) < 0;
          if (showBarTotals && lastDataSet > -1) {
            const lastMeta = chart.controller.getDatasetMeta(lastDataSet);
            // this is a lot of nonsense to grab the plot meta data
            // for the final (topmost) data set
            lastMeta.data.forEach( (bar: any, index: number) => {
              const data = rescaleLabel(totals[index], totals[index]);
              // magic numbers to the labels look reasonable
              context.fillText(data, bar._model.x - 12, bar._model.y - 5);
            });
          }
        },
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label + ": ";
            label += tooltipItem.yLabel + " ";
            label += cleanMetric(chartOptions.metric);
            return label;
          }
        }
      },
    },
  };
}

export function timeSeriesChartConfig(filterData: FilteredData,
                                      xAxisNames: string[],
                                      chartOptions: CustomChartOptions): AnnotatedChartConfiguration {
  const anno: BaseAnnotation[] = dateToAnnotation(chartOptions.selectedTouchstones);
  const offset: number = chartOptions.plotUncertainity ? 1 : 0;

  return {
    type: "line",
    data: {
      labels: xAxisNames,
      datasets: filterData.datasets,
    },
    options: {
      legend: {
        display: true,
        // this toggles on / off the confidence intervals
        labels: {
          // This hides the
          filter: function(item, chart) {
            return !item.text.includes('_');
          }
        },
        onClick: function(e, legendItem) { // need to hide index -1 and index +1
          let index = legendItem.datasetIndex;
          let ci = this.chart;
          let alreadyHidden = (ci.getDatasetMeta(index).hidden === null) ? false : ci.getDatasetMeta(index).hidden;
          let meta_lo = ci.getDatasetMeta(index - offset);
          let meta = ci.getDatasetMeta(index);
          let meta_hi = ci.getDatasetMeta(index + offset);
          if (!alreadyHidden) {
            meta_lo.hidden = true;
            meta.hidden = true;
            meta_hi.hidden = true;
          } else {
            meta_lo.hidden = null;
            meta.hidden = null;
            meta_hi.hidden = null;
          }

          ci.update();
        },
        position: "top",
      },
      title: {
        display: true,
        text: chartOptions.plotTitle,
      },
      plugins: {
        datalabels: {
          display: false,
        },
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: chartOptions.yAxisTitle,
          },
          ticks: {
            min: 0,
            callback: (value, index, values) => rescaleLabel(value, value)
          },
        }],
      },
      annotation: {
        annotations: anno,
      },

      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label + ": ";
            label += tooltipItem.yLabel + " ";
            label += cleanMetric(chartOptions.metric);
            return label;
          }
        }
      },

    },
  };
}
