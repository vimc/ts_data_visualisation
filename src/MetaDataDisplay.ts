import {CustomChartOptions} from "./Chart";

// there is almost certainly a library that does this!
function prettyDateAndTime(): string {
    const date: Date = new Date();
    return date.toISOString().substring(0, 19);
}

function largest(max: number, option: string) {
    const plural: boolean = max > 1;
    return "The largest " + max + " " + toPlural(option, plural) +
            (plural ? " are " : " is ") + "shown;<br>";
}

export function toPlural(noun: string, plural: boolean): string {
    switch (noun) {
        case "year":
        case "continent":
        case "region":
        case "disease":
        case "vaccine":
        case "touchstone":
            if (plural) {
                return noun + "s";
            } else {
                return noun;
            }
            break;

        case "country":
            if (plural) {
                return "countries";
            } else {
                return "country";
            }
            break;

        case "cofinance_status_2018":
            if (plural) {
                return "cofinance statuses";
            } else {
                return "cofinance status";
            }
            break;

        case "activity_type":
            if (plural) {
                return "activity types";
            } else {
                return "activity type";
            }
            break;

        default:
            return "ERROR!";
            break;
    }
}

// there's a lot of C+P programming here that could arguably be refactored into a
// single function, but in future they might need to be dictinct functions?
function prettyCountries(countryArr: string[], dict: { [code: string]: string },
                         maxShow: number): string {
    const countryCount: number = countryArr.length;
    if (countryCount > maxShow) {
        const retStr = countryCount.toString() + " countries including " +
                       countryArr.slice(0, maxShow).
                       map((x) => dict[x]).
                       join(", ");
        return retStr;
    } else {
        const retStr = "Countries: " + countryArr.
                        map((x) => dict[x]).join(", ");
        return retStr;
    }
}

function prettyVaccines(vaccineArr: string[], vaccineDict: { [code: string]: string }, maxShow: number): string {
    const vaccineCount: number = vaccineArr.length;
    if (vaccineCount > maxShow) {
        const retStr = vaccineCount.toString() + " vaccines including " +
                       vaccineArr.slice(0, maxShow).map((x) => vaccineDict[x]).join(", ");
        return retStr;
    } else {
        const retStr = "Vaccines: " + vaccineArr.map((x) => vaccineDict[x]).join(", ");
        return retStr;
    }
}

function prettyTouchstones(touchstoneArr: string[], maxShow: number): string {
    const touchstoneCount: number = touchstoneArr.length;
    if (touchstoneCount > maxShow) {
        const retStr = touchstoneCount.toString() + " touchstones including " +
                       touchstoneArr.slice(0, maxShow).join(", ");
        return retStr;
    } else {
        const retStr = "Touchstones: " + touchstoneArr.join(", ");
        return retStr;
    }
}

function prettyYears(yearLo: number, yearHi: number): string {
    const retStr = "From " + yearLo.toString() + " to " + yearHi.toString();
    return retStr;
}

function prettyActivities(activityTypes: string[]) {
    return activityTypes.map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(", ");
}

export function MetaDataDisplay(chartOptions: CustomChartOptions,
                                countrydict: { [code: string]: string },
                                vacDict: { [code: string]: string }): string {
    if (chartOptions.plotType === "Impact") {
        const metaStr: string = "<p>This plot shows the " +
                                chartOptions.metric.replace("_", " ") + " data for:<br>" +
                                prettyActivities(chartOptions.activityTypes) + ";<br>" +
                                prettyCountries(chartOptions.selectedCountries, countrydict, 4) + ";<br>" +
                                prettyVaccines(chartOptions.selectedVaccines, vacDict, 4) + ";<br>" +
                                prettyTouchstones(chartOptions.selectedTouchstones, 2) + ";<br>" +
                                prettyYears(chartOptions.yearLow, chartOptions.yearHigh) + ";<br>" +
                                "The data is divided up by " +
                                chartOptions.xAxis + " and " + chartOptions.yAxis + ";<br>" +
                                largest(chartOptions.maxPlot, chartOptions.xAxis) + "<\p>" +
                                "Plot produced at " + prettyDateAndTime() + "<\p>";
        return metaStr;
    } else if (chartOptions.plotType === "Time series") {
        const metaStr: string = "<p>This plot shows the " +
                                chartOptions.metric.replace("_", " ") + " data for:<br>" +
                                prettyActivities(chartOptions.activityTypes) + ";<br>" +
                                 prettyCountries(chartOptions.selectedCountries, countrydict, 4) + ";<br>" +
                                 prettyVaccines(chartOptions.selectedVaccines, vacDict, 4) + ";<br>" +
                                 prettyTouchstones(chartOptions.selectedTouchstones, 2) + ";<br>" +
                                 prettyYears(chartOptions.yearLow, chartOptions.yearHigh) + ";<br>" +
                                 "Each line represents a " + chartOptions.yAxis + ";<br>" +
                                 largest(chartOptions.maxPlot, chartOptions.xAxis) + "<\p>" +
                                 "Plot produced at " + prettyDateAndTime() + "<\p>";
        return metaStr;
    } else {
        return "ERROR!";
    }
}
