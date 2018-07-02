import {ImpactDataRow} from "./ImpactDataRow";

export type ImpactDataByCountry = { [country: string]: ImpactDataRow[] };
export type ImpactDataByVaccineAndThenCountry = { [vaccine: string]: ImpactDataByCountry };

export class DataFilterer {
    filterData(metric: string,
               maxPlot: number,
               compare: string,
               disagg: string,
               yearLo: number,
               yearHi: number,
               activityTypes: string[],
               selectedCountries: string[],
               cumulative: boolean,
               impactData: ImpactDataRow[],
               plotColours: { [p: string] : string }): any[] {
        // filter focal model
        const filtData0: ImpactDataRow[] = impactData.filter(function(row) {return row.is_focal == true;})
 //       console.debug(filtData0)
        // filter so that support = gavi
        const filtData1: ImpactDataRow[] = this.filterBySupport(filtData0, "gavi")
 //       console.debug(filtData1)
        // filter by years
        const filtData2: ImpactDataRow[] = this.filterBYear(filtData1, yearLo, yearHi);
 //       console.debug(filtData2)
        // filter by touchstone
        const filtData3: ImpactDataRow[] = this.filterByTouchstone(filtData2, "201710gavi");
 //       console.debug(filtData3)
        // filter by activity type
        const filtData4: ImpactDataRow[] = this.filterByActivityType(filtData3, activityTypes);
 //       console.debug(filtData4)
        // filter by activity type
        const filtData5: ImpactDataRow[] = this.filterByCountrySet(filtData4, selectedCountries);
 //       console.debug(filtData5)
        // TODO there might efficiencies to be had here by filtering in the right order...

        // now we filter by the compare and disaggregate parameters
        const temp = this.filterByCompare(maxPlot, compare, metric, filtData5);
        const compVars: any[] = temp[1];
        const filteredData: ImpactDataRow[] = temp[0];

        const aggVars: any[] = [...this.getUniqueVariables(-1, disagg, metric, filteredData)];
        const compVarsAsList = [...compVars];
        const dataByAggregate = this.groupDataByVaccineAndThenCountry(compare, disagg, aggVars, filteredData);

        let datasets = [];
        for (let aggVar of aggVars) {
            const dataByCountry = dataByAggregate[aggVar];
            // this is not const so that we can convert it to a cumulative plot later
            let deathsAvertedForVaccine: number[] = compVarsAsList.map(function (country: string) {
                const data: ImpactDataRow[] = dataByCountry[country];
                if (typeof data !== 'undefined') { // this is necessary to prevent errors when this compare / aggregate combo is empty
                    return data.map(x => x[metric])
                        .filter(x => !isNaN(x))
                        .reduce((acc, x) => acc + x, 0)
                        .toPrecision(3);
                } else {
                    return 0;
                }
            });

            // we're doing a cumulative plot
            if (cumulative) {
                deathsAvertedForVaccine = deathsAvertedForVaccine
                    .reduce((a: number[], x: number, i: number) => [...a, (+x) + (a[i-1] || 0)], [])
            }

            datasets.push({
                label: aggVar,
                data: deathsAvertedForVaccine,
                backgroundColor: plotColours[aggVar]
            });
        }

        return [datasets, compVars];
    }

    private groupDataByVaccineAndThenCountry(compare: string, disagg: string, vaccines: string[],
                                             filteredData: ImpactDataRow[]): ImpactDataByVaccineAndThenCountry {
        const dataByVaccine: ImpactDataByVaccineAndThenCountry = {};
        for (let vaccine in vaccines) {
            dataByVaccine[vaccine] = {};
        }
        for (let row of filteredData) {
            let dataByCountry = dataByVaccine[row[disagg]];
            if (!dataByCountry) {
                dataByCountry = dataByVaccine[row[disagg]] = {};
            }

            let list = dataByCountry[row[compare]];
            if (!list) {
                list = dataByCountry[row[compare]] = [];
            }

            list.push(row);
        }
        return dataByVaccine;
    }

    private filterByCompare(maxPlot: number,
                            compare: string,
                            metric: string,
                            impactData: ImpactDataRow[]): any[] {
        const uniqueCompare: Set<any> = this.getUniqueVariables(maxPlot, compare, metric, impactData);
        const filteredData = impactData.filter(d => uniqueCompare.has(d[compare]));
        return [filteredData, uniqueCompare];
    }

    // TODO Tidy this up!
    private getUniqueVariables(maxPlot: number,
                               compare: string,
                               metric: string,
                               impactData: ImpactDataRow[]): Set<any> {
        if (maxPlot > 0) {
            // this is taken from https://stackoverflow.com/a/49717936
            let groupedSummed = new Map<string, number>();
            impactData.map(function(row){
                 groupedSummed.set(row[compare], (groupedSummed.get(row[compare]) || 0) + row[metric])
            })
            if (compare != "year") {
                const sortedGroupSummed = [...groupedSummed].sort(function(a, b) {return a[1] < b[1] ? 1 : -1; })
                const sortedCompares = sortedGroupSummed.map(function (d) { return d[0]; })
                return new Set<any>(sortedCompares.slice(0, maxPlot))
            } else {
                const unsortedGroupSummed =  [...groupedSummed].map(function (d) { return d[0]; })
                return new Set<any>(unsortedGroupSummed.slice(0, maxPlot).sort())
            }
        } else {
            const allUnique: Set<any> = new Set([...new Set((impactData.map(x => x[compare])))].sort());
            return allUnique;
        }
    }

    private filterBySupport(impactData: ImpactDataRow[], supportType: string): ImpactDataRow[] {
        return impactData.filter(function(row) {return row.support_type === supportType;})
    }

    private filterByTouchstone(impactData: ImpactDataRow[], touchStone: string): ImpactDataRow[] {
        return impactData.filter(function(row) {return row.touchstone === touchStone;})
    }

    private filterByCountrySet(impactData: ImpactDataRow[], countrySet: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {
            let index: number = countrySet.indexOf(row.country)
            return index >= 0;
        })
    }

    private filterByActivityType(impactData: ImpactDataRow[], selectedActivityType: string[]): ImpactDataRow[] {
        return impactData.filter(function(row) {
            let index: number = selectedActivityType.indexOf(row.activity_type)
            return index >= 0;
        })
    }

    private filterBYear(impactData: ImpactDataRow[], yearLow: number, yearHigh:  number) {
        let dataFiltered = impactData.filter(function(row) {return row.year >= yearLow;})
        dataFiltered = dataFiltered.filter(function(row) {return row.year <= yearHigh;})

        return dataFiltered;
    }
}