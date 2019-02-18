import {CustomChartOptions} from "./Chart";
import {countryCodeToName, diseaseCodeToName, vaccineCodeToName} from "./Dictionaries"

// there is almost certainly a library that does this!
function prettyDataAndTime(): string {
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
		const retStr = countryArr.map(countryCodeToName).join(", ");
		return retStr;
	}
}

function prettyDiseases(diseaseArr: string[], maxShow: number): string {
	const diseaseCount: number = diseaseArr.length;
	if (diseaseCount > maxShow) {
		const retStr = diseaseCount.toString() + " diseases including " +
		               diseaseArr.slice(0, maxShow).map(diseaseCodeToName).join(", ");
		return retStr;
	} else {
		const retStr = diseaseArr.map(diseaseCodeToName).join(", ");
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
		const retStr = vaccineArr.map(vaccineCodeToName).join(", ");
		return retStr;
	}	
}

function prettyYears(yearLo: number, yearHi: number): string {
	const retStr = "the years " + yearLo.toString() + "-" + yearHi.toString();
	return retStr;
}

export function MetaDataDisplay(chartOptions: CustomChartOptions,
	                            human: boolean): string {
	const metr: string = chartOptions.metric;					// IMPROVE?
	const maxP: number = chartOptions.maxPlot;
	const yrLo: number = chartOptions.yearLow; 					//
	const yrHi: number = chartOptions.yearHigh;					//

	const xdisAgg: string = chartOptions.compare;
	const ydisAgg: string = chartOptions.disagg;

	const actType: string[] = chartOptions.activityTypes;
	const selCtry: string[] = chartOptions.selectedCountries;	//
	const selDise: string[] = chartOptions.selectedDiseases;	//
	const selVacc: string[] = chartOptions.selectedVaccines;
	const selTchs: string[] = chartOptions.selectedTouchstones;

	const pltType: string = "Impact / Time series";
	const cumul: string = "cum:TRUE / cum:FALSE"

	if (human) {
		const metaStr : string = "This plot show the " +
								 metr.replace("_", " ") + " data for " +
		                         prettyCountries(selCtry, 4) + ", " +
		                         prettyDiseases(selDise, 4) + ", " +
		                         prettyVaccines(selVacc, 4) + ", " +
		                         prettyYears(yrLo, yrHi) +
		                         ". Plot produced at " + prettyDataAndTime();
		return metaStr;
	} else {
		return "TODO!";
	}
}