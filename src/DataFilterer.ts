import {ImpactDataRow} from "./ImpactDataRow";
import {FilteredRow} from "./FilteredRow";

export type ImpactDataByCountry = { [country: string]: ImpactDataRow[] };
export type ImpactDataByVaccineAndThenCountry = { [vaccine: string]: ImpactDataByCountry };

export interface DataFiltererOptions {
    metric:              string;
    maxPlot:             number;
    compare:             string;
    disagg:              string;
    yearLow:             number;
    yearHigh:            number;
    activityTypes:       Array<string>;
    selectedCountries:   Array<string>;
    selectedDiseases:    Array<string>;
    selectedVaccines:    Array<string>;
    selectedTouchstones: Array<string>;
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
    compVars_top: any[];
}

export class DataFilterer {
    filterData(filterOptions: DataFiltererOptions,
               impactData:    ImpactDataRow[],
               plotColours:   { [p: string] : string }): FilteredData {
        const filtData = this.filterByAll(filterOptions, impactData);

        // now we filter by the compare variable
        const temp = this.filterByCompare(filterOptions.maxPlot, filterOptions.compare, filterOptions.metric, filtData);
        const compVars: any[] = temp[1];
        const filteredData: ImpactDataRow[] = temp[0];

        // get an array of all the remaining disagg values
        const aggVars: any[] = [...this.getUniqueVariables(-1, filterOptions.disagg, filterOptions.metric, filteredData)];
        const dataByAggregate = this.groupDataByDisaggAndThenCompare(filterOptions.compare, filterOptions.disagg, aggVars, filteredData);

        let datasets: FilteredRow[] = [];
        for (let aggVar of aggVars) {
            let summedMetricForDisagg: number[] = this.reduceSummary(dataByAggregate,
                                                                     aggVar,
                                                                     compVars,
                                                                     filterOptions.metric);
            // we're doing a cumulative plot
            if (filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i-1] || 0)], [])
            }
            // code here to convert sum to average

            if (filterOptions.timeSeries) {
                const fRow: FilteredRow = { label: aggVar,
                                            data: summedMetricForDisagg,
                                            borderColor: plotColours[aggVar],
                                            lineTension: 0.1,
                                            backgroundColor: 'transparent',
                                            pointBackgroundColor: 'plotColours[aggVar]',
                                            pointRadius: 2.5,
                                            pointHoverRadius: 7.5,
                                            pointHitRadius: 15,
                                            pointStyle: 'circle' };

                datasets.push(fRow);
            } else {
                const fRow: FilteredRow = { label: aggVar,
                                            data: summedMetricForDisagg,
                                            backgroundColor: plotColours[aggVar] };
                datasets.push(fRow);                
            }
            
        }
        // while we're here we might as well calculate the sum for each compare variable as we need them later
        let totals: number[] = [];
        for (let i = 0; i < compVars.length; ++i) {
            let total: number = 0;
            for (let ds of datasets) {
                total += (+ds.data[i]);
            }
            totals.push(total);
        }

        return {datasets, compVars, totals};
    }

    calculateMean(filterOptions: DataFiltererOptions,
                  impactData:    ImpactDataRow[],
                  plotColours:   { [p: string] : string }): MeanData {
        // compare will always be year!

        const filtData = this.filterByAll(filterOptions, impactData);

        let meanVars = this.meanVariables(filterOptions.metric);
        const top = meanVars.top;
        const bottom = meanVars.bottom;
        
        const temp_top = this.filterByCompare(-1, filterOptions.compare, top, filtData);
        const compVars_top: any[] = temp_top[1];
        const filteredData_top: ImpactDataRow[] = temp_top[0];
        // get an array of all the remaining disagg values
        const aggVars_top: any[] = [...this.getUniqueVariables(-1, filterOptions.disagg, top, filteredData_top)];
        const dataByAggregate_top = this.groupDataByDisaggAndThenCompare(filterOptions.compare, filterOptions.disagg, aggVars_top, filteredData_top);


        

        let datasets: FilteredRow[] = [];
        for (let aggVar of aggVars_top) {
            let summedMetricForDisagg: number[] = this.reduceSummary(dataByAggregate_top,
                                                                     aggVar,
                                                                     compVars_top,
                                                                     top);
            if (bottom != null) {
                const temp_bottom = this.filterByCompare(-1, filterOptions.compare, bottom, filtData);
                const compVars_bottom: any[] = temp_bottom[1];
                const filteredData_bottom: ImpactDataRow[] = temp_bottom[0];
                // get an array of all the remaining disagg values
                const aggVars_bottom: any[] = [...this.getUniqueVariables(-1, filterOptions.disagg, bottom, filteredData_bottom)];
                const dataByAggregate_bottom = this.groupDataByDisaggAndThenCompare(filterOptions.compare, filterOptions.disagg, aggVars_bottom, filteredData_bottom);
                let summedMetricForDisagg_bottom: number[] = this.reduceSummary(dataByAggregate_bottom,
                                                                                aggVar,
                                                                                compVars_bottom,
                                                                                bottom);               
                summedMetricForDisagg = summedMetricForDisagg.map( function(x, i) {
                    if (summedMetricForDisagg_bottom[i] != 0)
                        return (x / summedMetricForDisagg_bottom[i]);
                    else
                        return 0;
                });
            }
            // we're doing a cumulative plot
            if (filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i-1] || 0)], [])
            }

            const fRow: FilteredRow = { label: aggVar,
                                        data: summedMetricForDisagg,
                                        borderColor: plotColours[aggVar],
                                        lineTension: 0.1,
                                        backgroundColor: 'transparent',
                                        pointBackgroundColor: 'plotColours[aggVar]',
                                        pointRadius: 2.5,
                                        pointHoverRadius: 7.5,
                                        pointHitRadius: 15,
                                        pointStyle: 'circle' };

            datasets.push(fRow);
        }
        return {datasets, compVars_top};
    }

    private groupDataByDisaggAndThenCompare(compareName: string, disaggName: string, disaggVars: string[],
                                             filteredData: ImpactDataRow[]): ImpactDataByVaccineAndThenCountry {
        const dataByDisagg: ImpactDataByVaccineAndThenCountry = {};
        for (let disagg in disaggVars) {
            dataByDisagg[disagg] = {};
        }
        for (let row of filteredData) {
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
    // It will return an array of the largest compare variables and the original dataset with all but the largest removed
    private filterByCompare(maxPlot: number,
                            compare: string,
                            metric: string,
                            impactData: ImpactDataRow[]): [ImpactDataRow[], any[]] {
        const uniqueCompare: any[] = this.getUniqueVariables(maxPlot, compare, metric, impactData);
        const filteredData = impactData.filter(d => (uniqueCompare.indexOf(d[compare]) > -1));
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
            let groupedSummed = new Map<string, number>();
            impactData.map(function(row){
                 groupedSummed.set(row[compare], (groupedSummed.get(row[compare]) || 0) + row[metric])
            });
            if (compare != "year") {
                const sortedGroupSummed = [...groupedSummed].sort(function(a, b) {return a[1] < b[1] ? 1 : -1; });
                const sortedCompares = sortedGroupSummed.map(function (d) { return d[0]; });
                return sortedCompares.slice(0, maxPlot)
            } else {
                const unsortedGroupSummed =  [...groupedSummed].map(function (d) { return d[0]; });
                return unsortedGroupSummed.slice(0, maxPlot).sort()
            }
        } else {
            return [...new Set((impactData.map(x => x[compare])))].sort();
        }
    }

    private filterByFocality(impactData: ImpactDataRow[], isFocal: boolean): ImpactDataRow[] {
        return impactData.filter(function(row) {return row.is_focal == isFocal;})
    }

    private filterBySupport(impactData: ImpactDataRow[], supportType: string): ImpactDataRow[] {
        return impactData.filter(function(row) {return row.support_type === supportType;})
    }

    private filterByTouchstone(impactData: ImpactDataRow[], touchStone: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {return touchStone.indexOf(row.touchstone) > -1;})
    }

    private filterByDisease(impactData: ImpactDataRow[], diseaseSet: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {return diseaseSet.indexOf(row.disease) > -1;})
    }

    private filterByVaccine(impactData: ImpactDataRow[], vaccineSet: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {return vaccineSet.indexOf(row.vaccine) > -1;})
    }

    private filterByCountrySet(impactData: ImpactDataRow[], countrySet: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {return countrySet.indexOf(row.country) > -1;})
    }

    private filterByActivityType(impactData: ImpactDataRow[], selectedActivityType: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {return selectedActivityType.indexOf(row.activity_type) > -1;})
    }

    private filterByYear(impactData: ImpactDataRow[], yearLow: number, yearHigh:  number) {
        return impactData.filter(function(row) {return row.year >= yearLow;})
                         .filter(function(row) {return row.year <= yearHigh;})
    }

    private filterByAll(filterOptions: DataFiltererOptions,
                        impactData:    ImpactDataRow[],): ImpactDataRow[]  {
        let filtData = this.filterByFocality(impactData, true); // filter focal model
        filtData = this.filterBySupport(filtData, "gavi"); // filter so that support = gavi
        filtData = this.filterByYear(filtData, filterOptions.yearLow, filterOptions.yearHigh); // filter by years
        filtData = this.filterByTouchstone(filtData, filterOptions.selectedTouchstones); // filter by touchstone
        filtData = this.filterByActivityType(filtData, filterOptions.activityTypes); // filter by activity type
        filtData = this.filterByCountrySet(filtData, filterOptions.selectedCountries); // filter by activity type
        filtData = this.filterByDisease(filtData, filterOptions.selectedDiseases); // filter by diseases
        filtData = this.filterByVaccine(filtData, filterOptions.selectedVaccines); // filter by vaccine

        return filtData;
    }

    private meanVariables(CompareVariable: string): { [fracPart: string]: string } {
        switch (CompareVariable) {
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
                return {top: CompareVariable};
                break;
        }
    }

    private reduceSummary(aggregatedData: ImpactDataByVaccineAndThenCountry,
                          aggVar:string, compVars: any[],
                          metric: string): number[] {
        const dataByCompare = aggregatedData[aggVar];
        let summedMetricForDisagg: number[] = compVars.map(function (compare: string) {
            const data: ImpactDataRow[] = dataByCompare[compare];
            if (typeof data !== 'undefined') { // this is necessary to prevent errors when this compare / aggregate combo is empty
                const summedData =  data.map(x => x[metric])
                                        .filter(x => !isNaN(x))
                                        .reduce((acc, x) => acc + x, 0);
                return this.roundDown(summedData, 3);
            } else {
                return 0;
            }
        }, this);
        return summedMetricForDisagg;
    }

    // this function rounds DOWN to n significant figures
    private roundDown(value: number, sigFigs: number): number {
        const n: number = Math.ceil(Math.log(value + 1) / Math.log(10)); // log10 is not a standard Math function!
        if (n <= sigFigs)
            return value;

        const m: number = n - sigFigs; // this number is definitely positive

        return Math.floor(value / (Math.pow(10, m))) * (Math.pow(10, m));
    }
}