import {CustomChartOptions} from "./Chart";

export interface MetaDataDisplay {
	const str1: string = "Meta"
}

export function MetaDataDisplay(chartOptions: any[],
	                            human: bool): string {
	const base: string = "Metadata: ";
	const time: string = "00:00:00 ";	//TODO calcualte these at run time
	const data: string = "01/01/1970";

	const metr: string = chartOptions.metric;
	const maxP: string = chartOptions.maxPlot;
	const yrLo: string = chartOptions.yearLow;
	const yrHi: string = chartOptions.yearLow;

	const xdisAgg: string = chartOptions.compare;
	const ydisAgg: string = chartOptions.disagg;

	const actType: string[] = chartOptions.activityTypes;
	const selCtry: string[] = chartOptions.selectedCountries;
	const selDise: string[] = chartOptions.selectedDiseases;
	const selVacc: string[] = chartOptions.selectedVaccines;
	const selTchs: string[] = chartOptions.selectedTouchstones;

	const pltType: string = "Impact / Time series";
	const cumul: string = "cum:TRUE / cum:FALSE"

	if (!human) {

	} else {

	}
}