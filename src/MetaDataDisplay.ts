import {CustomChartOptions} from "./Chart";
import {countryCodeToName, diseaseCodeToName, vaccineCodeToName} from "./Dictionaries"

// there is almost certainly a library that does this!
function prettyDateAndTime(): string {
	const date: Date = new Date();
	return date.toISOString().substring(0, 19);
}

// there's a lot of C+P programming here that could arguably be refactored into a
//single function, but in future they might need to be dictinct functions?
function prettyCountries(countryArr: string[], maxShow: number): string {
	const countryCount: number = countryArr.length;
	if (countryCount > maxShow) {
		const retStr = countryCount.toString() + " countries including " +
		               countryArr.slice(0, maxShow).map(countryCodeToName).join(", ");
		return retStr;
	} else {
		const retStr = "Countries: " + countryArr.map(countryCodeToName).join(", ");
		return retStr;
	}
}

function prettyVaccines(vaccineArr: string[], maxShow: number): string {
	const vaccineCount: number = vaccineArr.length;
	if (vaccineCount > maxShow) {
		const retStr = vaccineCount.toString() + " vaccines including " +
		               vaccineArr.slice(0, maxShow).map(vaccineCodeToName).join(", ");
		return retStr;
	} else {
		const retStr = "Vaccines: " + vaccineArr.map(vaccineCodeToName).join(", ");
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
	return activityTypes.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(", ");
}

export function MetaDataDisplay(chartOptions: CustomChartOptions,
	                            human: boolean): string {
	if (human) { // produce human readable metadata
		if (chartOptions.plotType === "Impact") {
			const metaStr : string = "This plot shows the " +
									 chartOptions.metric.replace("_", " ") + " data for:\n" +
			                         prettyActivities(chartOptions.activityTypes) + ";\n" + 
			                         prettyCountries(chartOptions.selectedCountries, 4) + ";\n" +
			                         prettyVaccines(chartOptions.selectedVaccines, 4) + ";\n" +
			                         prettyTouchstones(chartOptions.selectedTouchstones, 2) + ";\n" +
			                         prettyYears(chartOptions.yearLow, chartOptions.yearHigh) + ".\n" +
			                         "The data is divided up by " +
			                         chartOptions.compare + " and " + chartOptions.disagg +
			                         ".\nPlot produced at " + prettyDateAndTime();
			return metaStr;
		} else if (chartOptions.plotType === "Time series") {
			const metaStr : string = "This plot shows the " +
									 chartOptions.metric.replace("_", " ") + " data for:\n" +
			                         prettyActivities(chartOptions.activityTypes) + ";\n" + 
			                         prettyCountries(chartOptions.selectedCountries, 4) + ";\n" +
			                         prettyVaccines(chartOptions.selectedVaccines, 4) + ";\n" +
			                         prettyTouchstones(chartOptions.selectedTouchstones, 2) + ";\n" +
			                         prettyYears(chartOptions.yearLow, chartOptions.yearHigh) + ".\n" +
			                         "Each line represents a " + chartOptions.disagg +
			                         ".\nPlot produced at " + prettyDateAndTime();
			return metaStr;
		} else {
			return "ERROR!";
		}
	}
}