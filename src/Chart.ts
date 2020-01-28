import {Chart, ChartConfiguration, ChartOptions} from "chart.js";
import {DataFilterer, DataFiltererOptions, FilteredData} from "./DataFilterer";
import {plotColours} from "./PlotColours";

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
  } // i don't think rounding x in (0,1) is a good idea need to think about this
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
      break;
    case "deaths_averted_rate":
      return("deaths averted rate");
      break;
    case "deaths":
      return("deaths");
      break;

    case "cases_averted":
      return("cases averted");
      break;
    case "cases_averted_rate":
      return("cases averted rate");
      break;
    case "cases":
      return("cases");
      break;

    case "dalys_averted_rate":
      return("dalys averted rate");
      break;
    case "dalys_averted":
      return("dalys averted");
      break;
    case "dalys":
      return("dalys");
      break;

    case "coverage":
      return("coverage");
      break;
    case "fvps":
      return("FVPs");
      break;

    default:
      return("Bad metric in cleanMetric");
      break;
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
            callback: (value, index, values) => rescaleLabel(value, value),
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
          let meta_lo = ci.getDatasetMeta(index - 1);
          let meta = ci.getDatasetMeta(index);
          let meta_hi = ci.getDatasetMeta(index + 1);
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
            callback: (value, index, values) => rescaleLabel(value, value),
            beginAtZero: true,
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
