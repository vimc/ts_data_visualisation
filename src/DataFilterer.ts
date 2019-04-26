import {FilteredRow} from "./FilteredRow";
import {ImpactDataRow} from "./ImpactDataRow";
import {niceColours} from "./PlotColours";

interface SplitImpactData {
    [country: string]: ImpactDataRow[];
}

interface ArrangedSplitImpactData {
    [vaccine: string]: SplitImpactData;
}

export interface DataFiltererOptions {
    metric: string;
    maxPlot: number;
    xAxis: string;
    disagg: string;
    yearLow: number;
    yearHigh: number;
    activityTypes: string[];
    selectedCountries: string[];
    selectedVaccines: string[];
    selectedTouchstones: string[];
    plotType: string;
    supportType: string[];
    cumulative: boolean;
    timeSeries: boolean;
}

/**
 * This objects contains the filtered data to be passed to the plot functions
 * @interface
 */
export interface FilteredData {
    /**
     * An array of to be used as the dataset in a chartjs plot
     * @abstract
     */
    datasets: FilteredRow[];
    /**
     * An array of string containing he names of the x axis variables
     * @abstract
     */
    xAxisVals: string[];
    /**
     * An array of numbers containing the totals of the datasets for each
     * element of XAxisVals. Strictly this is redundent as we could always
     * calculate it when needed. But there's no harm in doing once an passing it
     * around.
     * @abstract
     */
    totals: number[];
}

export interface UniqueData {
    data: ImpactDataRow[]
    xAxisVals: string[];
};

export class DataFilterer {
   /**
    * The function rounds DOWN to n siginificant figure
    *
    * @remarks
    * This is has been a point of contention between the funders and science
    * team.
    *
    * @param value - The number to be rounded
    * @param sigFigs - The number of significant figures (should be an integer
    *                  but we don't check)
    * @returns `value` rounded down to `sigFigs` significant figures
    */
    public roundDown(value: number, sigFigs: number): number {
        // this should never be hit (negative deaths shouldn't happen)
        // so we're not going to try anything clever
        if (value < 0) {
            return value;
        }

        const n: number = Math.ceil(Math.log(value + 1) / Math.log(10));
        // This calculate log10, whihc is not a standard Math function.
        const m: number = n - sigFigs; // this number is definitely positive

        return Math.floor(value / (Math.pow(10, m))) * (Math.pow(10, m));
    }

   /**
    * The function filters a dataset (an array of ImpactDataRows) based on some
    * parameters and returns a FilteredData object used by chartjs to produce
    * the plot
    *
    * @remarks
    *
    * @param filterOptions - A DataFiltererOptions object that contains the
    *                        filters that will be applied to the data
    * @param impactData - The data as an array of ImpactDataRows
    * @param plotColours - A dictionary of colours to be assigned to filtered
    *                      datasets
    *
    * @returns A FilteredData object containing the datasets (for a charjs
    *          plot), the names of the x-axis variables and the totals.
    */
    public filterData(filterOptions: DataFiltererOptions,
                      impactData: ImpactDataRow[],
                      plotColours: { [p: string]: string }): FilteredData {
        const filtData = this.filterByAll(filterOptions, impactData);

        // now we filter by the compare variable
        const maxCompare = filterOptions.timeSeries ? -1 : filterOptions.maxPlot;
        const temp: UniqueData = this.filterByCompare(maxCompare, filterOptions.xAxis,
                                          filterOptions.metric, filtData);
        // these are the values that go along the x-axis
        const xAxisVals: string[] = temp.xAxisVals;
        const filteredData: ImpactDataRow[] = temp.data;

        // get an array of all the remaining disagg values
        const aggVars: string[] =
            [...this.getUniqueVariables(-1, filterOptions.disagg,
                                            filterOptions.metric,
                                            filteredData)];
        // recombine the split data by aggVars
        const dataByAggregate: ArrangedSplitImpactData =
            this.ArrangeSplitData(filterOptions.xAxis, filterOptions.disagg,
                                  aggVars, filteredData);

        const datasets: FilteredRow[] = [];
        for (const aggVar of aggVars) {
            let summedMetricForDisagg: number[] =
                this.reduceSummary(dataByAggregate, aggVar, xAxisVals,
                                   filterOptions.metric);
            // we're doing a cumulative plot
            if (filterOptions.xAxis === "year" && filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce((a: number[], x: number, i: number) =>
                                            [...a, (+x) + (a[i - 1] || 0)], []);
            }
            // make sure we have colours for each 
            this.getColour(aggVar, plotColours, niceColours);

            // construct the relevant object for chartjs
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
                const fRow: FilteredRow = {
                        backgroundColor: plotColours[aggVar],
                        data: summedMetricForDisagg,
                        label: aggVar,
                    };
                datasets.push(fRow);
            }
        }
        // while we're here we might as well calculate the sum for each
        // x axis variable as we need them later
        const totals: number[] = [];
        for (let i = 0; i < xAxisVals.length; ++i) {
            let total: number = 0;
            for (const ds of datasets) {
                total += (+ds.data[i]);
            }
            totals.push(total);
        }

        return {datasets, xAxisVals, totals};
    }

   /**
    * The function filters a dataset (an array of ImpactDataRows) based on some
    * parameters and calculate ratios (to obtain e.g. death rates) then
    * returns a FilteredData object used by chartjs to produce the plot.
    *
    * @remarks
    * This function will only be called when filterOptions.xAxis === "year".
    * There probably should be some check (and fail state) that this is true.
    *
    * @param filterOptions - A DataFiltererOptions object that contains the
    *                        filters that will be applied to the data
    * @param impactData - The data as an array of ImpactDataRows
    * @param plotColours - A dictionary of colours to be assigned to filtered
    *                      datasets
    *
    * @returns A FilteredData object containing the datasets (for a charjs
    *          plot), the names of the x-axis variables and the totals.filterByCompare
    */
    public calculateMean(filterOptions: DataFiltererOptions,
                         impactData: ImpactDataRow[],
                         plotColours: { [p: string]: string }): FilteredData {
        // x axis will always be year!
        const filtData = this.filterByAll(filterOptions, impactData);

        // based on the metric get the top and bottom of the ratio
        // death_rate = death / population
        const meanVars = this.meanVariables(filterOptions.metric);
        const top: string = meanVars.top;
        const bottom: string = meanVars.bottom;

        // get data for the top of the ratio
        const tempTop: UniqueData = this.filterByCompare(-1, "year", top, filtData);
        const xAxisVals: string[] = tempTop.xAxisVals;
        const filteredDataTop: ImpactDataRow[] = tempTop.data;

        // get an array of all the remaining disagg values
        const aggVarsTop: string[] =
            [...this.getUniqueVariables(-1, filterOptions.disagg, top,
                                        filteredDataTop)];
        const dataByAggregateTop: ArrangedSplitImpactData =
            this.ArrangeSplitData("year", filterOptions.disagg, aggVarsTop,
                                  filteredDataTop);
        const datasets: FilteredRow[] = [];
        for (const aggVar of aggVarsTop) {
            let summedMetricForDisagg: number[] =
                this.reduceSummary(dataByAggregateTop, aggVar, xAxisVals, top);
            if (bottom != null) {
                const tempBottom: UniqueData =
                    this.filterByCompare(-1, "year", bottom, filtData);
                const xValsBottom: string[] = tempBottom.xAxisVals;
                const filteredDataVottom: ImpactDataRow[] = tempBottom.data;
                // get an array of all the remaining disagg values
                const aggVarsBottom: string[] =
                    [...this.getUniqueVariables(-1, filterOptions.disagg,
                                                bottom, filteredDataVottom)];
                const dataByAggregateBottom: ArrangedSplitImpactData =
                    this.ArrangeSplitData("year", filterOptions.disagg,
                                          aggVarsBottom, filteredDataVottom);
                const summedMetricForDisaggBottom: number[] =
                    this.reduceSummary(dataByAggregateBottom, aggVar,
                                       xValsBottom, bottom);
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

            // make sure we have colours for each 
            this.getColour(aggVar, plotColours, niceColours);

            const fRow: FilteredRow = {
                            backgroundColor: "transparent",
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

        // We never use totals but as with filterData we might as well sum them
        const totals: number[] = [];
        for (let i = 0; i < xAxisVals.length; ++i) {
            let total: number = 0;
            for (const ds of datasets) {
                total += (+ds.data[i]);
            }
            totals.push(total);
        }
        return {datasets: datasets, xAxisVals: xAxisVals, totals: totals};
    }
   /**
    * The function takes data (as an array of ImpactDataRows) and organises it
    * into a dictionary of dictionary. Index first by disaggName, then by
    * xAxisName.
    *  
    * @param xAxisName - The variable that goes along the x-axis
    * @param disaggName - The variable that we will be aggregating by
    * @param disaggVars - The different values for disaggName
    * @param filteredData - The data that will split and recombined
    *
    * @returns A AggregatedSplitImpactData object 
    */
    public ArrangeSplitData(xAxisName: string, disaggName: string,
                            disaggVars: string[],
                            filteredData: ImpactDataRow[]): ArrangedSplitImpactData {
        // create a dictionary of empty dictionaries
        const dataByDisagg: ArrangedSplitImpactData = {};
        disaggVars.map((disagg: string) => { dataByDisagg[disagg] = {}; } );
        // now fill 'em
        for (const row of filteredData) {
            let dataByCompare = dataByDisagg[row[disaggName]];
            if (!dataByCompare) {
                dataByCompare = dataByDisagg[row[disaggName]] = {};
            }

            let list = dataByCompare[row[xAxisName]];
            if (!list) {
                list = dataByCompare[row[xAxisName]] = [];
            }

            list.push(row);
        }
        return dataByDisagg;
    }

    // This function calls getUniqueVariables to find the largest compare
    // variables wrt to metric
    // Then it calculates the maxPlot largest compare variables and filters
    // out the rest from the original dataset
    // It will return an array of the largest compare variables and
    // the original dataset with all but the largest removed
    public filterByCompare(maxPlot: number,
                           xAxisVar: string,
                           metric: string,
                           impactData: ImpactDataRow[]): UniqueData {
        const uniqueCompare: string[] =
            this.getUniqueVariables(maxPlot, xAxisVar, metric, impactData);
        const filteredData = impactData.filter((d) =>
                                      (uniqueCompare.indexOf(d[xAxisVar]) > -1));
        return {data: filteredData, xAxisVals: uniqueCompare};
    }

    // TODO Tidy this up!
    // This function groups the data by the compare variable, then sums by the
    // metric variable
    // It returns an array of the largest maxPlot compare variables wrt metric
    public getUniqueVariables(maxPlot: number,
                              xAxisVar: string,
                              metric: string,
                              impactData: ImpactDataRow[]): string[] {
        if (maxPlot > 0) {
            // this is taken from https://stackoverflow.com/a/49717936
            const groupedSummed = new Map<string, number>();
            impactData.map((row) => {
                 groupedSummed.set(row[xAxisVar],
                                   (groupedSummed.get(row[xAxisVar]) || 0) +
                                   (row[metric] === "NA" ? 0 : row[metric]),
                                  );
            });
            if (xAxisVar !== "year") {
                const sortedGroupSummed =
                    [...groupedSummed].sort((a, b) => a[1] < b[1] ? 1 : -1 );
                const sortedCompares = sortedGroupSummed.map((d) => d[0]);
                return sortedCompares.slice(0, maxPlot);
            } else {
                const unsortedGroupSummed = [...groupedSummed].map((d) => d[0]);
                return unsortedGroupSummed.slice(0, maxPlot).sort();
            }
        } else {
            return [...new Set((impactData.map((x) => x[xAxisVar])))].sort();
        }
    }

    public filterByFocality(impactData: ImpactDataRow[],
                            isFocal: boolean): ImpactDataRow[] {
        return impactData.filter((row) => row.is_focal === isFocal );
    }

    public filterBySupport(impactData: ImpactDataRow[],
                           supportType: string[]): ImpactDataRow[] {
        return impactData.filter((row) =>
            supportType.indexOf(row.support_type) > -1 );
    }

    public filterByTouchstone(impactData: ImpactDataRow[],
                              touchStone: string[]): ImpactDataRow[] {
        return impactData.filter((row) =>
            touchStone.indexOf(row.touchstone) > -1 );
    }

    public filterByVaccine(impactData: ImpactDataRow[],
                           vaccineSet: string[]): ImpactDataRow[] {
        return impactData.filter((row) =>
            vaccineSet.indexOf(row.vaccine) > -1 );
    }

    public filterByCountrySet(impactData: ImpactDataRow[],
                              countrySet: string[]): ImpactDataRow[] {
        return impactData.filter((row) =>
            countrySet.indexOf(row.country) > -1 );
    }

    public filterByActivityType(impactData: ImpactDataRow[],
                                selectedActivity: string[]): ImpactDataRow[] {
        return impactData.filter((row) =>
            selectedActivity.indexOf(row.activity_type) > -1 );
    }

    public filterByYear(impactData: ImpactDataRow[], yearLow: number,
                        yearHigh: number) {
        return impactData.filter((row) => row.year >= yearLow )
                         .filter((row) => row.year <= yearHigh );
    }

    public filterByAll(filterOptions: DataFiltererOptions,
                       impactData: ImpactDataRow[]): ImpactDataRow[] {
         // filter focal model
        let filtData = this.filterByFocality(impactData, true);
        // filter so that support = gavi
        filtData = this.filterBySupport(filtData, filterOptions.supportType);
        // filter by years
        filtData = this.filterByYear(filtData, filterOptions.yearLow,
                                     filterOptions.yearHigh);
        // filter by touchstone
        filtData = this.filterByTouchstone(filtData,
                                           filterOptions.selectedTouchstones);
        // filter by activity type
        filtData = this.filterByActivityType(filtData,
                                             filterOptions.activityTypes);
        // filter by activity type
        filtData = this.filterByCountrySet(filtData,
                                           filterOptions.selectedCountries);
        // filter by vaccine
        filtData = this.filterByVaccine(filtData,
                                        filterOptions.selectedVaccines);
        return filtData;
    }

    public meanVariables(compareVariable: string): { [fracPart: string]: string } {
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

    public reduceSummary(aggregatedData: ArrangedSplitImpactData,
                         aggVar: string, xAxisVar: string[],
                         metric: string): number[] {
        const dataByCompare = aggregatedData[aggVar];
        const summedMetricForDisagg: number[] =
            xAxisVar.map((xAxisVar: string) => {
                const data: ImpactDataRow[] = dataByCompare[xAxisVar];
                if (typeof data !== "undefined") {
                    // this is necessary to prevent errors when this compare +
                    // aggregate combo is empty
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

    // This is a slightly hacky way to dynamically assign colours to keys that
    // don't have them
    // This should never be hit, if it is we should add the missing colours to
    // ./PlotColours.ts
    private getColour(key: string, colourDict: { [key: string]: string },
                      bonusColours: { [key: string]: string }): void {
        // check if this key is in the dictionary...
        if (!(key in colourDict)) { // ...if not try to find a new colour
            console.log("Warning: " + key + " does not have a default colour");
            // make sure we have some nice colours to add
            if (Object.keys(bonusColours).length > 0) {
                // convert niceColours to an array
                const extraCNames = Object.keys(bonusColours);
                // pick one at random
                const colourName: string =
                    extraCNames[Math.floor(Math.random() * extraCNames.length)];
                // add it to the colourDictionary
                $.extend(colourDict, { [key]: bonusColours[colourName]});
                // delete it from the list of available colours
                delete bonusColours[colourName];
            } else {
                console.log("Additional warning: We have run out of nice colours");
                // if there are no colours, so add a neutral grey colour so that
                // it should be obvious when we've run out of colours.
                $.extend(colourDict, { [key]: "#999999"});
            }
        }
    }
}
