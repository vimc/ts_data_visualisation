import {ImpactDataRow} from "./ImpactDataRow";
import {FilteredRow} from "./FilteredRow";

export type ImpactDataByCountry = { [country: string]: ImpactDataRow[] };
export type ImpactDataByVaccineAndThenCountry = { [vaccine: string]: ImpactDataByCountry };

export interface DataFiltererOptions {
    metric:            string;
    maxPlot:           number;
    compare:           string;
    disagg:            string;
    yearLow:           number;
    yearHigh:          number;
    activityTypes:     Array<string>;
    selectedCountries: Array<string>;
    selectedDiseases:  Array<string>;
    selectedVaccines:  Array<string>;
    cumulative:        boolean;
}

export class DataFilterer {
     filterData(filterOptions: DataFiltererOptions,
                impactData:    ImpactDataRow[],
                plotColours:   { [p: string] : string }): any[] {
        let filtData = this.filterByFocality(impactData, true); // filter focal model
        filtData = this.filterBySupport(filtData, "gavi"); // filter so that support = gavi
        filtData = this.filterBYear(filtData, filterOptions.yearLow, filterOptions.yearHigh); // filter by years
        filtData = this.filterByTouchstone(filtData, "201710gavi-201807wue"); // filter by touchstone
        filtData = this.filterByActivityType(filtData, filterOptions.activityTypes); // filter by activity type
        filtData = this.filterByCountrySet(filtData, filterOptions.selectedCountries); // filter by activity type
        filtData = this.filterByDisease(filtData, filterOptions.selectedDiseases); // filter by diseases
        filtData = this.filterByVaccine(filtData, filterOptions.selectedVaccines); // filter by vaccine
        // TODO there might efficiencies to be had here by filtering in the right order...
        // TODO There is a more functional way to do this is we define a wrapper class for ImpactDataRow[]

        // now we filter by the compare variable
        const temp = this.filterByCompare(filterOptions.maxPlot, filterOptions.compare, filterOptions.metric, filtData);
        const compVars: any[] = temp[1];
        const filteredData: ImpactDataRow[] = temp[0];

        // get an array of all the remaining disagg values
        const aggVars: any[] = [...this.getUniqueVariables(-1, filterOptions.disagg, filterOptions.metric, filteredData)];
        const dataByAggregate = this.groupDataByDisaggAndThenCompare(filterOptions.compare, filterOptions.disagg, aggVars, filteredData);


        let datasets: FilteredRow[] = [];
        for (let aggVar of aggVars) {
            const dataByCompare = dataByAggregate[aggVar];
            // this is not const in case we need to convert it to a cumulative plot later
            let summedMetricForDisagg: number[] = compVars.map(function (country: string) {
                const data: ImpactDataRow[] = dataByCompare[country];
                if (typeof data !== 'undefined') { // this is necessary to prevent errors when this compare / aggregate combo is empty
                    return data.map(x => x[filterOptions.metric])
                        .filter(x => !isNaN(x))
                        .reduce((acc, x) => acc + x, 0)
                        .toPrecision(3); // this should possibly be an argument or calculated at run time
                } else {
                    return 0;
                }
            });

            // we're doing a cumulative plot
            if (filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i-1] || 0)], [])
            }
            const fRow: FilteredRow = { label: aggVar,
                                        data: summedMetricForDisagg,
                                        backgroundColor: plotColours[aggVar] };
            datasets.push(fRow);
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

        return [datasets, compVars, totals];
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

    private filterByTouchstone(impactData: ImpactDataRow[], touchStone: string): ImpactDataRow[] {
        return impactData.filter(function(row) {return row.touchstone === touchStone;})
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

    private filterBYear(impactData: ImpactDataRow[], yearLow: number, yearHigh:  number) {
        return impactData.filter(function(row) {return row.year >= yearLow;})
                         .filter(function(row) {return row.year <= yearHigh;})
    }
}