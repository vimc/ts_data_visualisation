"use strict";
exports.__esModule = true;
var PlotColours_1 = require("./PlotColours");
var DataFilterer = /** @class */ (function () {
    function DataFilterer() {
    }
    // this function rounds DOWN to n significant figures
    DataFilterer.prototype.roundDown = function (value, sigFigs) {
        // this should never be hit (negative deaths shouldn't happen)
        // so we're not going to try anything clever
        if (value < 0) {
            return value;
        }
        var n = Math.ceil(Math.log(value + 1) / Math.log(10));
        // log10 is not a standard Math function!
        var m = n - sigFigs; // this number is definitely positive
        return Math.floor(value / (Math.pow(10, m))) * (Math.pow(10, m));
    };
    DataFilterer.prototype.filterData = function (filterOptions, impactData, plotColours) {
        var filtData = this.filterByAll(filterOptions, impactData);
        // now we filter by the compare variable
        var maxCompare = filterOptions.timeSeries ? -1 : filterOptions.maxPlot;
        var temp = this.filterByCompare(maxCompare, filterOptions.compare, filterOptions.metric, filtData);
        // these are the values that go along the x-axis
        var compVars = temp[1];
        var filteredData = temp[0];
        // get an array of all the remaining disagg values
        var aggVars = this.getUniqueVariables(-1, filterOptions.disagg, filterOptions.metric, filteredData).slice();
        var dataByAggregate = this.groupDataByDisaggAndThenCompare(filterOptions.compare, filterOptions.disagg, aggVars, filteredData);
        var datasets = [];
        for (var _i = 0, aggVars_1 = aggVars; _i < aggVars_1.length; _i++) {
            var aggVar = aggVars_1[_i];
            var summedMetricForDisagg = this.reduceSummary(dataByAggregate, aggVar, compVars, filterOptions.metric);
            // we're doing a cumulative plot
            if (filterOptions.compare === "year" && filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce(function (a, x, i) {
                    return a.concat([(+x) + (a[i - 1] || 0)]);
                }, []);
            }
            // code here to convert sum to average
            this.getColour(aggVar, plotColours, PlotColours_1.niceColours);
            if (filterOptions.timeSeries) {
                var fRow = { backgroundColor: "transparent",
                    borderColor: plotColours[aggVar],
                    data: summedMetricForDisagg,
                    label: aggVar,
                    lineTension: 0.1,
                    pointBackgroundColor: "plotColours[aggVar]",
                    pointHitRadius: 15,
                    pointHoverRadius: 7.5,
                    pointRadius: 2.5,
                    pointStyle: "circle"
                };
                datasets.push(fRow);
            }
            else {
                var fRow = {
                    backgroundColor: plotColours[aggVar],
                    data: summedMetricForDisagg,
                    label: aggVar
                };
                datasets.push(fRow);
            }
        }
        // while we're here we might as well calculate the sum for each
        // compare variable as we need them later
        var totals = [];
        for (var i = 0; i < compVars.length; ++i) {
            var total = 0;
            for (var _a = 0, datasets_1 = datasets; _a < datasets_1.length; _a++) {
                var ds = datasets_1[_a];
                total += (+ds.data[i]);
            }
            totals.push(total);
        }
        return { datasets: datasets, compVars: compVars, totals: totals };
    };
    DataFilterer.prototype.calculateMean = function (filterOptions, impactData, plotColours) {
        // compare will always be year!
        var filtData = this.filterByAll(filterOptions, impactData);
        var meanVars = this.meanVariables(filterOptions.metric);
        var top = meanVars.top;
        var bottom = meanVars.bottom;
        var tempTop = this.filterByCompare(-1, "year", top, filtData);
        var compVarsTop = tempTop[1];
        var filteredDataTop = tempTop[0];
        // get an array of all the remaining disagg values
        var aggVarsTop = this.getUniqueVariables(-1, filterOptions.disagg, top, filteredDataTop).slice();
        var dataByAggregateTop = this.groupDataByDisaggAndThenCompare("year", filterOptions.disagg, aggVarsTop, filteredDataTop);
        var datasets = [];
        var _loop_1 = function (aggVar) {
            var summedMetricForDisagg = this_1.reduceSummary(dataByAggregateTop, aggVar, compVarsTop, top);
            if (bottom != null) {
                var tempBottom = this_1.filterByCompare(-1, "year", bottom, filtData);
                var compVarsBottom = tempBottom[1];
                var filteredDataVottom = tempBottom[0];
                // get an array of all the remaining disagg values
                var aggVarsBottom = this_1.getUniqueVariables(-1, filterOptions.disagg, bottom, filteredDataVottom).slice();
                var dataByAggregateBottom = this_1.groupDataByDisaggAndThenCompare("year", filterOptions.disagg, aggVarsBottom, filteredDataVottom);
                var summedMetricForDisaggBottom_1 = this_1.reduceSummary(dataByAggregateBottom, aggVar, compVarsBottom, bottom);
                summedMetricForDisagg = summedMetricForDisagg.map(function (x, i) {
                    if (summedMetricForDisaggBottom_1[i] !== 0) {
                        return (x / summedMetricForDisaggBottom_1[i]);
                    }
                    else {
                        return 0;
                    }
                });
            }
            // we're doing a cumulative plot
            if (filterOptions.cumulative) {
                summedMetricForDisagg = summedMetricForDisagg
                    .reduce(function (a, x, i) { return a.concat([(+x) + (a[i - 1] || 0)]); }, []);
            }
            this_1.getColour(aggVar, plotColours, PlotColours_1.niceColours);
            var fRow = {
                backgroundColor: "transparent",
                borderColor: plotColours[aggVar],
                data: summedMetricForDisagg,
                label: aggVar,
                lineTension: 0.1,
                pointBackgroundColor: "plotColours[aggVar]",
                pointHitRadius: 15,
                pointHoverRadius: 7.5,
                pointRadius: 2.5,
                pointStyle: "circle"
            };
            datasets.push(fRow);
        };
        var this_1 = this;
        for (var _i = 0, aggVarsTop_1 = aggVarsTop; _i < aggVarsTop_1.length; _i++) {
            var aggVar = aggVarsTop_1[_i];
            _loop_1(aggVar);
        }
        return { datasets: datasets, compVarsTop: compVarsTop };
    };
    DataFilterer.prototype.groupDataByDisaggAndThenCompare = function (compareName, disaggName, disaggVars, filteredData) {
        var dataByDisagg = {};
        disaggVars.map(function (disagg) { dataByDisagg[disagg] = {}; });
        for (var _i = 0, filteredData_1 = filteredData; _i < filteredData_1.length; _i++) {
            var row = filteredData_1[_i];
            var dataByCompare = dataByDisagg[row[disaggName]];
            if (!dataByCompare) {
                dataByCompare = dataByDisagg[row[disaggName]] = {};
            }
            var list = dataByCompare[row[compareName]];
            if (!list) {
                list = dataByCompare[row[compareName]] = [];
            }
            list.push(row);
        }
        return dataByDisagg;
    };
    // This function calls getUniqueVariables to find the largest compare
    // variables wrt to metric
    // Then it calculates the maxPlot largest compare variables and filters
    // out the rest from the original dataset
    // It will return an array of the largest compare variables and
    // the original dataset with all but the largest removed
    DataFilterer.prototype.filterByCompare = function (maxPlot, compare, metric, impactData) {
        var uniqueCompare = this.getUniqueVariables(maxPlot, compare, metric, impactData);
        var filteredData = impactData.filter(function (d) {
            return (uniqueCompare.indexOf(d[compare]) > -1);
        });
        return [filteredData, uniqueCompare];
    };
    // TODO Tidy this up!
    // This function groups the data by the compare variable, then sums by the
    // metric variable
    // It returns an array of the largest maxPlot compare variables wrt metric
    DataFilterer.prototype.getUniqueVariables = function (maxPlot, compare, metric, impactData) {
        if (maxPlot > 0) {
            // this is taken from https://stackoverflow.com/a/49717936
            var groupedSummed_1 = new Map();
            impactData.map(function (row) {
                groupedSummed_1.set(row[compare], (groupedSummed_1.get(row[compare]) || 0) +
                    (row[metric] === "NA" ? 0 : row[metric]));
            });
            if (compare !== "year") {
                var sortedGroupSummed = groupedSummed_1.slice().sort(function (a, b) { return a[1] < b[1] ? 1 : -1; });
                var sortedCompares = sortedGroupSummed.map(function (d) { return d[0]; });
                return sortedCompares.slice(0, maxPlot);
            }
            else {
                var unsortedGroupSummed = groupedSummed_1.slice().map(function (d) { return d[0]; });
                return unsortedGroupSummed.slice(0, maxPlot).sort();
            }
        }
        else {
            return new Set((impactData.map(function (x) { return x[compare]; }))).slice().sort();
        }
    };
    DataFilterer.prototype.filterByFocality = function (impactData, isFocal) {
        return impactData.filter(function (row) { return row.is_focal === isFocal; });
    };
    DataFilterer.prototype.filterBySupport = function (impactData, supportType) {
        return impactData.filter(function (row) {
            return supportType.indexOf(row.support_type) > -1;
        });
    };
    DataFilterer.prototype.filterByTouchstone = function (impactData, touchStone) {
        return impactData.filter(function (row) {
            return touchStone.indexOf(row.touchstone) > -1;
        });
    };
    DataFilterer.prototype.filterByVaccine = function (impactData, vaccineSet) {
        return impactData.filter(function (row) {
            return vaccineSet.indexOf(row.vaccine) > -1;
        });
    };
    DataFilterer.prototype.filterByCountrySet = function (impactData, countrySet) {
        return impactData.filter(function (row) {
            return countrySet.indexOf(row.country) > -1;
        });
    };
    DataFilterer.prototype.filterByActivityType = function (impactData, selectedActivity) {
        return impactData.filter(function (row) {
            return selectedActivity.indexOf(row.activity_type) > -1;
        });
    };
    DataFilterer.prototype.filterByYear = function (impactData, yearLow, yearHigh) {
        return impactData.filter(function (row) { return row.year >= yearLow; })
            .filter(function (row) { return row.year <= yearHigh; });
    };
    DataFilterer.prototype.filterByAll = function (filterOptions, impactData) {
        // filter focal model
        var filtData = this.filterByFocality(impactData, true);
        // filter so that support = gavi
        filtData = this.filterBySupport(filtData, filterOptions.supportType);
        // filter by years
        filtData = this.filterByYear(filtData, filterOptions.yearLow, filterOptions.yearHigh);
        // filter by touchstone
        filtData = this.filterByTouchstone(filtData, filterOptions.selectedTouchstones);
        // filter by activity type
        filtData = this.filterByActivityType(filtData, filterOptions.activityTypes);
        // filter by activity type
        filtData = this.filterByCountrySet(filtData, filterOptions.selectedCountries);
        // filter by vaccine
        filtData = this.filterByVaccine(filtData, filterOptions.selectedVaccines);
        return filtData;
    };
    DataFilterer.prototype.meanVariables = function (compareVariable) {
        switch (compareVariable) {
            case "coverage":
                return { top: "fvps", bottom: "target_population" };
                break;
            case "deaths_averted_rate":
                return { top: "deaths_averted", bottom: "fvps" };
                break;
            case "cases_averted_rate":
                return { top: "cases_averted", bottom: "fvps" };
                break;
            default:
                return { top: compareVariable };
                break;
        }
    };
    DataFilterer.prototype.reduceSummary = function (aggregatedData, aggVar, compVars, metric) {
        var _this = this;
        var dataByCompare = aggregatedData[aggVar];
        var summedMetricForDisagg = compVars.map(function (compare) {
            var data = dataByCompare[compare];
            if (typeof data !== "undefined") {
                // this is necessary to prevent errors when this compare +
                // aggregate combo is empty
                var summedData = data.map(function (x) { return x[metric]; })
                    .filter(function (x) { return !isNaN(x); })
                    .reduce(function (acc, x) { return acc + x; }, 0);
                return _this.roundDown(summedData, 3);
            }
            else {
                return 0;
            }
        }, this);
        return summedMetricForDisagg;
    };
    // This is a slightly hacky way to dynamically assign colours to keys that
    // don't have them
    // This should never be hit, if it is we should add the missing colours to
    // ./PlotColours.ts
    DataFilterer.prototype.getColour = function (key, colourDict, bonusColours) {
        var _a, _b;
        // check if this key is in the dictionary...
        if (!(key in colourDict)) { // ...if not try to find a new colour
            console.log("Warning: " + key + " does not have a default colour");
            // make sure we have some nice colours to add
            if (Object.keys(bonusColours).length > 0) {
                // convert niceColours to an array
                var extraCNames = Object.keys(bonusColours);
                // pick one at random
                var colourName = extraCNames[Math.floor(Math.random() * extraCNames.length)];
                // add it to the colourDictionary
                $.extend(colourDict, (_a = {}, _a[key] = bonusColours[colourName], _a));
                // delete it from the list of available colours
                delete bonusColours[colourName];
            }
            else {
                console.log("Additional warning: We have run out of nice colours");
                // if there are no colours, so add a neutral grey colour so that
                // it should be obvious when we've run out of colours.
                $.extend(colourDict, (_b = {}, _b[key] = "#999999", _b));
            }
        }
    };
    return DataFilterer;
}());
exports.DataFilterer = DataFilterer;
