import {DataFiltererOptions} from "./DataFilterer";

/*
This handles all the error messages for the DataVisTool.
If there is some combination of filters that produces problematic plot add
a message here.
*/
export class WarningMessageManager {
    public getError(filterOptions: DataFiltererOptions): string {
        if ((filterOptions.selectedTouchstones.length > 1) &&
            (filterOptions.xAxis !== "touchstone")) {
          return "Multiple touchstones have been selected, Compare across should " +
                 "be set to touchstone otherwise the data shown will be meaningless";
        }

        if (filterOptions.yearLow > filterOptions.yearHigh) {
          return "Year low is after year high";
        }

        return "";
    }
}
