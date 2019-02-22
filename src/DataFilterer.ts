import {FilteredRow} from "./FilteredRow";
import {ImpactDataRow} from "./ImpactDataRow";

interface ImpactDataByCountry {
    [country: string]: ImpactDataRow[];
}

interface ImpactDataByVaccineAndThenCountry {
    [vaccine: string]: ImpactDataByCountry;
}

export interface DataFiltererOptions {
    metric:              string;
    maxPlot:             number;
    compare:             string;
    disagg:              string;
    yearLow:             number;
    yearHigh:            number;
    activityTypes:       Array<string>;
    selectedCountries:   Array<string>;
    selectedVaccines:    Array<string>;
    selectedTouchstones: Array<string>;
    plotType:            string;
    cumulative:          boolean;
    timeSeries:          boolean;
}

export interface FilteredData {
    datasets: FilteredRow[];
    compVars: any[];
    totals: number[];
}

export interface MeanData {
    datasets: FilteredRow[];
    compVarsTop: any[];
}

export class DataFilterer {
    // this function rounds DOWN to n significant figures
    public roundDown(value: number, sigFigs: number): number {
        // this should never be hit (negative deaths shouldn't happen)
        // so we're not going to try anything clever
        if (value < 0) {
            return value;
        }

        const n: number = Math.ceil(Math.log(value + 1) / Math.log(10)); // log10 is not a standard Math function!
        const m: number = n - sigFigs; // this number is definitely positive

        return Math.floor(value / (Math.pow(10, m))) * (Math.pow(10, m));
    }

    public filterData(filterOptions: DataFiltererOptions,
                      impactData: ImpactDataRow[],
                      plotColours: { [p: string]: string }): FilteredData {
        const filtData = this.filterByAll(filterOptions, impactData);

        // now we filter by the compare variable
        const maxCompare = filterOptions.timeSeries ? -1 : filterOptions.maxPlot;
        const temp = this.filterByCompare(maxCompare, filterOptions.compare, filterOptions.metric, filtData);
        const compVars: any[] = temp[1]; // these are the values that go along the x-axis
        const filteredData: ImpactDataRow[] = temp[0];

        // get an array of all the remaining disagg values
        const aggVars: any[] = [...this.getUniqueVariables(-1, filterOptions.disagg,
                                                           filterOptions.metric, filteredData)];
        const dataByAggregate = this.groupDataByDisaggAndThenCompare(filterOptions.compare,
                                                                     filterOptions.disagg,
                                                                     aggVars,
                                                                     filteredData);

        const datasets: FilteredRow[] = [];
        for (const aggVar of aggVars) {
            let summedMetricForDisagg: number[] = this.reduceSummary(dataByAggregate,
                                                                     aggVar,
                                                                     compVars,
                                                                     filterOptions.metric);
            // we're doing a cumulative plot
            if (filterOptions.compare === "year" && filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i - 1] || 0)], []);
            }
            // code here to convert sum to average

            if (filterOptions.timeSeries) {
                const fRow: FilteredRow = { backgroundColor: "transparent",
                                            borderColor: plotColours[aggVar],
                                            data: summedMetricForDisagg,
                                            label: aggVar,
                                            lineTension: 0.1,
                                            pointBackgroundColor: "plotColours[aggVar]",
                                            pointHitRadius: 15,
                                            pointHoverRadius: 7.5,
                                            pointRadius: 2.5,
                                            pointStyle: "circle",
                                        };

                datasets.push(fRow);
            } else {
                const fRow: FilteredRow = { backgroundColor: plotColours[aggVar],
                                            data: summedMetricForDisagg,
                                            label: aggVar,
                                        };
                datasets.push(fRow);
            }
        }
        // while we're here we might as well calculate the sum for each compare variable as we need them later
        const totals: number[] = [];
        for (let i = 0; i < compVars.length; ++i) {
            let total: number = 0;
            for (const ds of datasets) {
                total += (+ds.data[i]);
            }
            totals.push(total);
        }

        return {datasets, compVars, totals};
    }

    public calculateMean(filterOptions: DataFiltererOptions,
                         impactData: ImpactDataRow[],
                         plotColours: { [p: string]: string }): MeanData {
        // compare will always be year!
        const filtData = this.filterByAll(filterOptions, impactData);

        const meanVars = this.meanVariables(filterOptions.metric);
        const top = meanVars.top;
        const bottom = meanVars.bottom;
        const tempTop = this.filterByCompare(-1, "year", top, filtData);
        const compVarsTop: any[] = tempTop[1];
        const filteredDataTop: ImpactDataRow[] = tempTop[0];
        // get an array of all the remaining disagg values
        const aggVarsTop: any[] = [...this.getUniqueVariables(-1, filterOptions.disagg, top, filteredDataTop)];
        const dataByAggregateTop = this.groupDataByDisaggAndThenCompare("year",
                                                                        filterOptions.disagg,
                                                                        aggVarsTop,
                                                                        filteredDataTop);
        const datasets: FilteredRow[] = [];
        for (const aggVar of aggVarsTop) {
            let summedMetricForDisagg: number[] = this.reduceSummary(dataByAggregateTop,
                                                                     aggVar,
                                                                     compVarsTop,
                                                                     top);
            if (bottom != null) {
                const tempBottom = this.filterByCompare(-1, "year", bottom, filtData);
                const compVarsBottom: any[] = tempBottom[1];
                const filteredDataVottom: ImpactDataRow[] = tempBottom[0];
                // get an array of all the remaining disagg values
                const aggVarsBottom: any[] = [...this.getUniqueVariables(-1,
                                                                         filterOptions.disagg,
                                                                         bottom,
                                                                         filteredDataVottom)];
                const dataByAggregateBottom = this.groupDataByDisaggAndThenCompare("year",
                                                                                   filterOptions.disagg,
                                                                                   aggVarsBottom,
                                                                                   filteredDataVottom);
                const summedMetricForDisaggBottom: number[] = this.reduceSummary(dataByAggregateBottom,
                                                                                 aggVar,
                                                                                 compVarsBottom,
                                                                                 bottom);
                summedMetricForDisagg = summedMetricForDisagg.map( (x, i) => {
                    if (summedMetricForDisaggBottom[i] !== 0) {
                        return (x / summedMetricForDisaggBottom[i]);
                    } else {
                        return 0;
                    }
                });
            }
            // we're doing a cumulative plot
            if (filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i - 1] || 0)], []);
            }

            const fRow: FilteredRow = { backgroundColor: "transparent",
                                        borderColor: plotColours[aggVar],
                                        data: summedMetricForDisagg,
                                        label: aggVar,
                                        lineTension: 0.1,
                                        pointBackgroundColor: "plotColours[aggVar]",
                                        pointHitRadius: 15,
                                        pointHoverRadius: 7.5,
                                        pointRadius: 2.5,
                                        pointStyle: "circle",
                                    };

            datasets.push(fRow);
        }
        return {datasets, compVarsTop};
    }

    private groupDataByDisaggAndThenCompare(compareName: string, disaggName: string, disaggVars: string[],
                                            filteredData: ImpactDataRow[]): ImpactDataByVaccineAndThenCountry {
        const dataByDisagg: ImpactDataByVaccineAndThenCountry = {};
        disaggVars.map((disagg: string) => { dataByDisagg[disagg] = {}; } );

        for (const row of filteredData) {
            let dataByCompare = dataByDisagg[row[disaggName]];
            if (!dataByCompare) {
                dataByCompare = dataByDisagg[row[disaggName]] = {};
            }

            let list = dataByCompare[row[compareName]];
            if (!list) {
                list = dataByCompare[row[compareName]] = [];
            }

            list.push(row);
        }
        return dataByDisagg;
    }

    // This function calls getUniqueVariables to find the largest compare variables wrt to metric
    // Then it calculates the maxPlot largest compare variables and filters out the rest from the original dataset
    // It will return an array of the largest compare variables and
    // the original dataset with all but the largest removed
    private filterByCompare(maxPlot: number,
                            compare: string,
                            metric: string,
                            impactData: ImpactDataRow[]): [ImpactDataRow[], any[]] {
        const uniqueCompare: any[] = this.getUniqueVariables(maxPlot, compare, metric, impactData);
        const filteredData = impactData.filter((d) => (uniqueCompare.indexOf(d[compare]) > -1));
        return [filteredData, uniqueCompare];
    }

    // TODO Tidy this up!
    // This function groups the data by the compare variable, then sums by the metric variable
    // It returns an array of the largest maxPlot compare variables wrt metric
    private getUniqueVariables(maxPlot: number,
                               compare: string,
                               metric: string,
                               impactData: ImpactDataRow[]): any[] {
        if (maxPlot > 0) {
            // this is taken from https://stackoverflow.com/a/49717936
            const groupedSummed = new Map<string, number>();
            impactData.map((row) => {
                 groupedSummed.set(row[compare], (groupedSummed.get(row[compare]) || 0) + row[metric]);
            });
            if (compare !== "year") {
                const sortedGroupSummed = [...groupedSummed].sort((a, b) => a[1] < b[1] ? 1 : -1 );
                const sortedCompares = sortedGroupSummed.map((d) => d[0] );
                return sortedCompares.slice(0, maxPlot);
            } else {
                const unsortedGroupSummed =  [...groupedSummed].map((d) => d[0] );
                return unsortedGroupSummed.slice(0, maxPlot).sort();
            }
        } else {
            return [...new Set((impactData.map((x) => x[compare])))].sort();
        }
    }

    private filterByFocality(impactData: ImpactDataRow[], isFocal: boolean): ImpactDataRow[] {
        return impactData.filter((row) => row.is_focal === isFocal );
    }

    private filterBySupport(impactData: ImpactDataRow[], supportType: string): ImpactDataRow[] {
        return impactData.filter((row) => row.support_type === supportType );
    }

    private filterByTouchstone(impactData: ImpactDataRow[], touchStone: string[]): ImpactDataRow[] {
        return impactData.filter((row) => touchStone.indexOf(row.touchstone) > -1 );
    }

    private filterByVaccine(impactData: ImpactDataRow[], vaccineSet: string[]): ImpactDataRow[] {
        return impactData.filter((row) => vaccineSet.indexOf(row.vaccine) > -1 );
    }

    private filterByCountrySet(impactData: ImpactDataRow[], countrySet: string[]): ImpactDataRow[] {
        return impactData.filter((row) => countrySet.indexOf(row.country) > -1 );
    }

    private filterByActivityType(impactData: ImpactDataRow[], selectedActivityType: string[]): ImpactDataRow[] {
        return impactData.filter((row) => selectedActivityType.indexOf(row.activity_type) > -1 );
    }

    private filterByYear(impactData: ImpactDataRow[], yearLow: number, yearHigh: number) {
        return impactData.filter((row) => row.year >= yearLow )
                         .filter((row) => row.year <= yearHigh );
    }

    private filterByAll(filterOptions: DataFiltererOptions,
                        impactData: ImpactDataRow[]): ImpactDataRow[] {
        let filtData = this.filterByFocality(impactData, true); // filter focal model
        filtData = this.filterBySupport(filtData, "gavi"); // filter so that support = gavi
        filtData = this.filterByYear(filtData, filterOptions.yearLow, filterOptions.yearHigh); // filter by years
        filtData = this.filterByTouchstone(filtData, filterOptions.selectedTouchstones); // filter by touchstone
        filtData = this.filterByActivityType(filtData, filterOptions.activityTypes); // filter by activity type
        filtData = this.filterByCountrySet(filtData, filterOptions.selectedCountries); // filter by activity type
        filtData = this.filterByVaccine(filtData, filterOptions.selectedVaccines); // filter by vaccine

        return filtData;
    }

    private meanVariables(compareVariable: string): { [fracPart: string]: string } {
        switch (compareVariable) {
            case "coverage":
                return {top: "fvps", bottom: "target_population"};
                break;

            case "deaths_averted_rate":
                return {top: "deaths_averted", bottom: "fvps"};
                break;

            case "cases_averted_rate":
                return {top: "cases_averted", bottom: "fvps"};
                break;

            default:
                return {top: compareVariable};
                break;
        }
    }

    private reduceSummary(aggregatedData: ImpactDataByVaccineAndThenCountry,
                          aggVar: string, compVars: any[],
                          metric: string): number[] {
        const dataByCompare = aggregatedData[aggVar];
        const summedMetricForDisagg: number[] = compVars.map((compare: string) => {
            const data: ImpactDataRow[] = dataByCompare[compare];
            if (typeof data !== "undefined") {
                // this is necessary to prevent errors when this compare / aggregate combo is empty
                const summedData =  data.map((x) => x[metric])
                                        .filter((x) => !isNaN(x))
                                        .reduce((acc, x) => acc + x, 0);
                return this.roundDown(summedData, 3);
            } else {
                return 0;
            }
        }, this);
        return summedMetricForDisagg;
    }
}
