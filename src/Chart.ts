/**
 * Functions in this file are mostly just helper functions for the chartjs
 * plotting
 */

import {Chart, ChartConfiguration, ChartOptions} from "chart.js";
import {DataFilterer, DataFiltererOptions, FilteredData} from "./DataFilterer";
import {plotColours} from "./PlotColours";

/**
 * For various UI reasons we need to know which years a touchstone ends on.
 * That is what this is. This probably should be read in from a source file
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

/**
 * Produces a label with reasonable units (thousands, millions, billions)
 *
 * @param value - The value to be rescaled
 * @param scale - The scale, this will usually be the largest number we've seen
 *
 * @returns The rescaled value + label as a string
 */
export function rescaleLabel(value: number, scale: number): string {
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
  }
  return value.toString();
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

/**
 * Produces a label with reasonable units (thousands, millions, billions)
 *
 * @param value - The value to be rescaled
 * @param scale - The scale, this will usually be the largest number we've seen
 *
 * @returns The rescaled value + label as a string
 */
export function annotationHelper(touchstone: string, year: number,
                                 colour: string): BaseAnnotation {
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

/**
 * Produces a chartjs config object for an impact plot
 *
 * @param filterData The filtered data
 * @param compareNames The names that go along the x axis
 * @param chartOptions The options that were used to filter the data
 *
 * @returns A chartjs config
 */
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
            callback: (value, index, values) => rescaleLabel(value, value),
          },
        }],
      },
      // This hides or shows labels on each block. We only show labels if the
      // block is a least 1/10th of the total block (trying to print a label
      // on every small block is a mess)
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
      // This adds the sum of all values at the top of the bars
      animation: {
        // this has to be a methodName() and not a () => or else it breaks chart.js!
        onComplete() {
          const chart = this.chart;
          const context = chart.ctx;
          const lastDataSet: number = ds.length - 1;
          if (lastDataSet > -1) {
            const lastMeta = chart.controller.getDatasetMeta(lastDataSet);
            // this is a lot of nonsense to grab the plot meta data
            // for the final (topmost) data set
            lastMeta.data.forEach( (bar: any, index: number) => {
              const data = rescaleLabel(totals[index],
                totals[index]);
              // magic numbers to the labels look reasonable
              context.fillText(data, bar._model.x - 12, bar._model.y - 5);
            });
          }
        },
      },
      // Override the default hover tool-tip
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label + ": ";
            label += tooltipItem.yLabel + " ";
            label += cleanMetric(chartOptions.metric);
            return label;
          },
        },
      },
    },
  };
}

/**
 * Produces a chartjs config object for a time series plot
 *
 * @param filterData The filtered data
 * @param compareNames The names that go along the x axis
 * @param chartOptions The options that were used to filter the data
 *
 * @returns A chartjs config
 */
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
        // This hides the legend elements to the confidence intervals
        labels: {
          // This hides the any label with a '_' in it
          // This works because we have named the data sets
          // [ABC_lo, ABC, ABC_hi]
          filter: function(item, chart) {
            return !item.text.includes('_');
          },
        },
        // This makes it so when we click the nth element of the legend we also
        // hide/show the (n-1)th and the (n+1)th. This combined with setting the
        // labels to be ordered [ABC_lo, ABC, ABC_hi] has the desired effect.
        // This is all a bit hacky so be careful when changing how uncertainity
        // is shown.
        onClick: function(e, legendItem) {
          const index = legendItem.datasetIndex;
          const ci = this.chart;
          const alreadyHidden = (ci.getDatasetMeta(index).hidden === null) ? false : ci.getDatasetMeta(index).hidden;
          const metaLo = ci.getDatasetMeta(index - offset);
          const meta = ci.getDatasetMeta(index);
          const metaHi = ci.getDatasetMeta(index + offset);
          if (!alreadyHidden) {
            metaLo.hidden = true;
            meta.hidden = true;
            metaHi.hidden = true;
          } else {
            metaLo.hidden = null;
            meta.hidden = null;
            metaHi.hidden = null;
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
            callback: (value, index, values) => rescaleLabel(value, value),
            beginAtZero: true,
          },
        }],
      },
      annotation: {
        annotations: anno,
      },
      // Override the default hover tool-tip
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label + ": ";
            label += tooltipItem.yLabel + " ";
            label += cleanMetric(chartOptions.metric);
            return label;
          },
        },
      },

    },
  };
}
