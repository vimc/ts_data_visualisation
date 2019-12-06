import {FilteredRow} from "./FilteredRow";
import {ImpactDataRow} from "./ImpactDataRow";
import {MetricsAndOptions} from "./MetricsAndOptions";
import {niceColours} from "./PlotColours";
import * as Color from "color";

interface SplitImpactData {
    [key: string]: ImpactDataRow[];
}

interface ArrangedSplitImpactData {
    [key: string]: SplitImpactData;
}

export interface DataFiltererOptions {
    metric: string;
    maxPlot: number;
    xAxis: string;
    yAxis: string;
    yearLow: number;
    yearHigh: number;
    activityTypes: string[];
    selectedCountries: string[];
    selectedVaccines?: string[];
    selectedDiseases?: string[];
    selectedTouchstones: string[];
    plotType: string;
    supportType: string[];
    cumulative: boolean;
    ageGroup: string;
}

export function upperLowerNames(metric: string): { [key: string]: string } {
    switch (metric) {
        case "dalys":
            return({low: "dalys_lo", high:"dalys_hi"});

        case "dalys_averted":
            return({low: "dalys_av_lo", high:"dalys_av_hi"});

        case "dalys_no_vac":
            return({low: "dalys_nv_lo", high:"dalys_nv_hi"});

        case "deaths":
            return({low: "deaths_lo", high:"deaths_hi"});

        case "deaths_averted":
            return({low: "deaths_av_lo", high:"deaths_av_hi"});

        case "deaths_no_vac":
            return({low: "deaths_nv_lo", high:"deaths_nv_hi"});
        
        default:
            console.log("Unexpected metric", metric);
            return({});
    }
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
    data: ImpactDataRow[];
    xAxisVals: string[];
}

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
                      metsAndOpts: MetricsAndOptions,
                      plotColours: { [p: string]: string }): FilteredData {
        const filtData = this.filterByAll(filterOptions, metsAndOpts, impactData);

        // now we filter by the compare variable
        const isTimeSeries: boolean = (filterOptions.plotType === "Time series");
        const xAxis = isTimeSeries ? "year" : filterOptions.xAxis;
        const maxCompare = isTimeSeries ? -1 : filterOptions.maxPlot;
        const temp: UniqueData =
                    this.filterByxAxis(isTimeSeries ? -1 : maxCompare,  xAxis,
                                       filterOptions.metric, filtData);

        //const temp: UniqueData = this.filterByxAxis(-1, "year", top, filtData);
        // these are the values that go along the x-axis
        const xAxisVals: string[] = temp.xAxisVals;
        const filteredData: ImpactDataRow[] = temp.data;

        // get upper and lower metric names
        const uncertainity: { [key: string]: string } =
                                          upperLowerNames(filterOptions.metric);

        // get an array of all the remaining y axis values
        const yAxisVars: string[] =
            [...this.getUniqueVariables(-1, filterOptions.yAxis,
                                            filterOptions.metric,
                                            filteredData)];
        // recombine the split data by y axis values
        const organisedData: ArrangedSplitImpactData =
            this.ArrangeSplitData(xAxis, filterOptions.yAxis,
                                  yAxisVars, filteredData);

        const datasets: FilteredRow[] = [];
        for (const yAxisVal of yAxisVars) {
            // if we have uncertainity grab the upper and lower bounds
            if ((uncertainity.low != null) && (uncertainity.low != null) &&
                (filterOptions.plotType === "Time series")) {
                const fRow = this.getDataRow(organisedData, yAxisVal, xAxisVals,
                                             filterOptions, plotColours,
                                             niceColours, uncertainity.low,
                                             "low");
                datasets.push(fRow);
            }

            const fRow = this.getDataRow(organisedData, yAxisVal, xAxisVals,
                                         filterOptions, plotColours,
                                         niceColours, filterOptions.metric,
                                         "mid");
            datasets.push(fRow);

            if ((uncertainity.low != null) && (uncertainity.low != null) &&
                (filterOptions.plotType === "Time series")) {
                const fRow = this.getDataRow(organisedData, yAxisVal, xAxisVals,
                                             filterOptions, plotColours,
                                             niceColours, uncertainity.high,
                                             "high");
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
    * This is needed for when we are calculating rates accross multiple e.g
    * countries.
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
                         metsAndOpts: MetricsAndOptions,
                         plotColours: { [p: string]: string }): FilteredData {
        // x axis will always be year!
        const filtData = this.filterByAll(filterOptions, metsAndOpts, impactData);

        // based on the metric get the top and bottom of the ratio
        // death_rate = death / population
        const meanVars = this.meanVariables(filterOptions.metric);
        const top: string = meanVars.top;
        const bottom: string = meanVars.bottom;

        // get data for the top of the ratio
        const tempTop: UniqueData = this.filterByxAxis(-1, "year", top, filtData);
        const xAxisVals: string[] = tempTop.xAxisVals;
        const filteredDataTop: ImpactDataRow[] = tempTop.data;

        // get an array of all the remaining y axis values
        const yAxisVarsTop: string[] =
            [...this.getUniqueVariables(-1, filterOptions.yAxis, top,
                                        filteredDataTop)];
        const dataByYAxisTop: ArrangedSplitImpactData =
            this.ArrangeSplitData("year", filterOptions.yAxis, yAxisVarsTop,
                                  filteredDataTop);
        const datasets: FilteredRow[] = [];
        for (const yVar of yAxisVarsTop) {
            let summedMetricByYAxis: number[] =
                this.reduceSummary(dataByYAxisTop, yVar, xAxisVals, top);
            if (bottom != null) {
                const tempBottom: UniqueData =
                    this.filterByxAxis(-1, "year", bottom, filtData);
                const xValsBottom: string[] = tempBottom.xAxisVals;
                const filteredDataVottom: ImpactDataRow[] = tempBottom.data;
                // get an array of all the remaining Y Axis values
                const yAxisVarsBottom: string[] =
                    [...this.getUniqueVariables(-1, filterOptions.yAxis,
                                                bottom, filteredDataVottom)];
                const dataByYAxisBottom: ArrangedSplitImpactData =
                    this.ArrangeSplitData("year", filterOptions.yAxis,
                                          yAxisVarsBottom, filteredDataVottom);
                const summedMetricByYAxisBottom: number[] =
                    this.reduceSummary(dataByYAxisBottom, yVar,
                                       xValsBottom, bottom);
                summedMetricByYAxis = summedMetricByYAxis.map( (x, i) => {
                    if (summedMetricByYAxisBottom[i] !== 0) {
                        return (x / summedMetricByYAxisBottom[i]);
                    } else {
                        return 0;
                    }
                });
            }
            // we're doing a cumulative plot
            if (filterOptions.cumulative) {
                summedMetricByYAxis = summedMetricByYAxis
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i - 1] || 0)], []);
            }

            // make sure we have colours for each yVar
            this.getColour(yVar, plotColours, niceColours);
            const fRow = this.getChartJsRow(filterOptions.plotType,
                                            plotColours[yVar], yVar,
                                            summedMetricByYAxis, false);
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
        return {datasets, xAxisVals, totals};
    }
   /**
    * The function takes data (as an array of ImpactDataRows) and organises it
    * into a dictionary of dictionary. Index first by yAxisName, then by
    * xAxisName.
    *
    * @remark This function relies on the Javascript behaviour for making copies
    * of arrays and objects. (Twice!)
    * let a = []
    * let b = a
    * b.push("test")
    * \\ b[0] = "test"
    *
    * @param xAxisName - The variable that goes along the x-axis
    * @param yAxisName - The variable that we will be arranging by
    * @param yAxisVars - The different values for yAxisName
    * @param filteredData - The data that will organsied
    *
    * @returns A AggregatedSplitImpactData object
    */
    public ArrangeSplitData(xAxisName: string, yAxisName: string,
                            yAxisVars: string[],
                            filteredData: ImpactDataRow[]): ArrangedSplitImpactData {
        // create a dictionary of empty dictionaries
        const dataByYAxis: ArrangedSplitImpactData = {};

        if (yAxisName === "none") {
            dataByYAxis["none"] = {};

            for (const row of filteredData) {
                let dataByCompare = dataByYAxis["none"];
                if (!dataByCompare) {
                    dataByCompare = dataByYAxis["none"] = {};
                }

                let list = dataByCompare[row[xAxisName]];
                if (!list) {
                    list = dataByCompare[row[xAxisName]] = [];
                }
                list.push(row);
            }
        } else {
            yAxisVars.map((y: string) => { dataByYAxis[y] = {}; } );
            // now fill 'em in
            for (const row of filteredData) {
                let dataByCompare = dataByYAxis[row[yAxisName]];
                if (!dataByCompare) {
                    dataByCompare = dataByYAxis[row[yAxisName]] = {};
                }

                let list = dataByCompare[row[xAxisName]];
                if (!list) {
                    list = dataByCompare[row[xAxisName]] = [];
                }

                // At this line of code `dataByCompare` is pointing at the
                // object with key `row[yAxisName]` in `dataByYAxis`,
                // And `list` is pointing to the array in `dataByCompare`
                // with key row[xAxisName]. Which itself points at an object in
                // `dataByYAxis`.
                // So when we push we are pushing row into the array in the object
                // `dataByYAxis` via two levels of redirection!
                list.push(row);
            }
        }
        return dataByYAxis;
    }

   /**
    * This function is mainly a wrapper to getUniqueVariables to find the
    * largest xAxisVar variables wrt to metric
    * Then it calculates the maxPlot largest compare variables and filters
    * out the rest from the original dataset
    *
    * @param maxPlot - We return the largest N... (if this is -1 we return all)
    * @param xAxisVar - ...x Axis variables...
    * @param metric - ...with repect to this metric
    * @param impactData - The data that will be filtered
    *
    * @returns An UniqueData object consist of of the largest compare
    * variables and the original dataset with all but the largest maxPlot
    * removed
    */
    public filterByxAxis(maxPlot: number,
                         xAxisVar: string,
                         metric: string,
                         impactData: ImpactDataRow[]): UniqueData {
        const uniqueCompare: string[] =
            this.getUniqueVariables(maxPlot, xAxisVar, metric, impactData);
        const filteredData = impactData.filter((d) =>
                                      (uniqueCompare.indexOf(d[xAxisVar]) > -1));
        return {data: filteredData, xAxisVals: uniqueCompare};
    }

   /**
    * This function calls getUniqueVariables to find the largest xAxisVar
    * variables wrt to metric
    * Then it calculates the maxPlot largest compare variables and filters
    * out the rest from the original dataset
    *
    * @param maxPlot - We return the largest N...
    * @param xAxisVar - ...x Axis variables...
    * @param metric - ...with repect to this metric
    * @param impactData - The data that will be filtered
    *
    * @returns An array of strings with the N largest x axis variables
    */
    public getUniqueVariables(maxPlot: number,
                              xAxisVar: string,
                              metric: string,
                              impactData: ImpactDataRow[]): string[] {
        if (xAxisVar === "none") {
            return(["none"]);
        }

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

    public filterIsInList(impactData: ImpactDataRow[], variable: string,
                          isIn: any[]) {
        return impactData.filter((row) =>
            isIn.indexOf(row[variable]) > -1);
    }

    public filterByNumericBetween(impactData: ImpactDataRow[], variable: string,
                                  low: number, high: number) {
        return impactData.filter((row) => row[variable] >= low )
                         .filter((row) => row[variable] <= high );
    }

    public filterByIsEqualTo(impactData: ImpactDataRow[], variable: string,
                             toEqual: any) {
        return impactData.filter((row) => row[variable] === toEqual);
    }

   /**
    * The function filters a dataset (an array of ImpactDataRows) based
    * on the the parameters in a DataFiltererOptions object
    *
    * @remark This function essentiall calls all the filterByXYZ functions
    * above in order. The order was vaguely chosen to be as fast as possible
    * i.e. do the biggest filter first. I may have got this wrong. it was
    * based on guess work.
    *
    * @param impactData - The data that will be filtered
    * @param filterOptions - A DataFiltererOptions object
    *
    * @returns An array of ImpactDataRow with all the invalid rows removed
    */
    public filterByAll(filterOptions: DataFiltererOptions,
                       metsAndOpts: MetricsAndOptions,
                       impactData: ImpactDataRow[]): ImpactDataRow[] {
        let filtData = impactData;  
        // filter by secret options
        if (metsAndOpts.secretOptions) {
            for (const opt of Object.keys(metsAndOpts.secretOptions)) {
                filtData = this.filterByIsEqualTo(filtData, opt,
                                                  metsAndOpts.secretOptions[opt][0]);
            }
        }
        // filter so that support = gavi
        if (metsAndOpts.filterOptions.indexOf("support_type") > -1) {
            filtData = this.filterIsInList(filtData, "support_type",
                                           filterOptions.supportType);
        }
        // filter by years
        if (metsAndOpts.filterOptions.indexOf("year") > -1) {
            filtData = this.filterByNumericBetween(filtData, "year",
                               filterOptions.yearLow, filterOptions.yearHigh);
        }
        // filter by touchstone
        if (metsAndOpts.filterOptions.indexOf("touchstone") > -1) {
            filtData = this.filterIsInList(filtData, "touchstone",
                                           filterOptions.selectedTouchstones);
        }
        // filter by activity type
        if (metsAndOpts.filterOptions.indexOf("activity_type") > -1) {
            filtData = this.filterIsInList(filtData, "activity_type",
                                           filterOptions.activityTypes);
        }
        // filter by country
        if (metsAndOpts.filterOptions.indexOf("country") > -1) {
            filtData = this.filterIsInList(filtData, "country",
                                           filterOptions.selectedCountries);
        }
        // filter by vaccine
        if (metsAndOpts.filterOptions.indexOf("vaccine") > -1) {
            filtData = this.filterIsInList(filtData, "vaccine",
                                           filterOptions.selectedVaccines);
        }
        // filter by age group
        if (metsAndOpts.filterOptions.indexOf("age_group") > -1) {
            filtData = this.filterByIsEqualTo(filtData, "age_group",
                                              filterOptions.ageGroup);
        }
        // filter by disease
        if (metsAndOpts.filterOptions.indexOf("disease") > -1) {
            filtData = this.filterIsInList(filtData, "disease",
                                           filterOptions.selectedDiseases);
        }

        return filtData;
    }

   /**
    * A simple look up that given a ratio metric, returns the top and bottom
    * of the ratio.
    *
    * @param compareVariable - The metric
    *
    * @returns An object with top and bottom members
    */
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

   /**
    * Sums and rounds down the organised data (any other simple post
    * processing to data should be done here)
    *
    * @param aggregatedData - The organised data
    * @param yAxisVar - The Y axis value that we are summing
    * @param xAxisVar - An array of the X axis values
    * @param metric - The metric
    *
    * @returns A array of numbers, the same length as the xAxisVar
    */
    public reduceSummary(organisedData: ArrangedSplitImpactData,
                         yAxisVar: string, xAxisVar: string[],
                         metric: string): number[] {
        const dataByYAxis = organisedData[yAxisVar];
        const summedMetricByYAxis: number[] =
            xAxisVar.map((xVar: string) => {
                const data: ImpactDataRow[] = dataByYAxis[xVar];
                if (typeof data !== "undefined") {
                    // this is necessary to prevent errors when this yAxisVar +
                    // xAxisVar combo is empty
                    const summedData =  data.map((x) => x[metric])
                                            .filter((x) => !isNaN(x))
                                            .reduce((acc, x) => acc + x, 0);
                    return this.roundDown(summedData, 3);
                } else {
                    return 0;
                }
        }, this);
        return summedMetricByYAxis;
    }

   /**
    * Dynamically assign colours to keys that don't have them. This should
    * never be hit, if it is we should add the missing colours to ./PlotColours.ts
    *
    * @param key - The value that we want a colour for
    * @param colourDict - A dictionary of predefined colours
    * @param bonusColours - An array on nice extra colours
    *
    * @returns Nothing, modifies colourDict.
    */
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

    public getDataRow(organisedData: ArrangedSplitImpactData, yAxisVal: string,
                       xAxisVals: string[], filterOptions: DataFiltererOptions,
                       plotColours: { [p: string]: string },
                       niceColours: { [p: string]: string },
                       metric: string,
                       pos: string) {
        let summedMetricByYAxis: number[] =
            this.reduceSummary(organisedData, yAxisVal, xAxisVals,
                               metric);

        // we're doing a cumulative plot
        if (filterOptions.xAxis === "year" && filterOptions.cumulative) {
            summedMetricByYAxis = summedMetricByYAxis
                .reduce((a: number[], x: number, i: number) =>
                                        [...a, (+x) + (a[i - 1] || 0)], []);
        }

        // make sure we have colours for each yAxisVal
        this.getColour(yAxisVal, plotColours, niceColours);
        const fRow = this.getChartJsRow(filterOptions.plotType,
                                        plotColours[yAxisVal], yAxisVal,
                                        summedMetricByYAxis,
                                        (pos == "low") ? "+2" : false,
                                        (pos == "mid"));
        return fRow;
    }

    public getChartJsRow(plotMode: string, valueColor: string,
                          label: string, data: number[], fill: any,
                          show: boolean = true): FilteredRow {
        if (plotMode === "Time series") {
            const fRow: FilteredRow =
                {
                    backgroundColor: Color(valueColor).alpha(0.5),
                    borderColor: valueColor,
                    borderWidth: show ? 2 : 0.1,
                    data: data,
                    fill: fill,
                    label: label,
                    lineTension: 0.0,
                    pointBackgroundColor: valueColor,
                    pointHitRadius: 15,
                    pointHoverRadius: show ? 5 : 0.0,
                    pointRadius: show ? 2.5 : 0.0,
                    pointStyle: "circle",
                };
            return fRow;
        } else {
            const fRow: FilteredRow = 
                {
                    backgroundColor:valueColor,
                    data: data,
                    label: label,
                };
            return fRow;
        }
    }
}
