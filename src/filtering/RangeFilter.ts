import {Filter, FilterSettings} from "./Filter";
import * as ko from "knockout";

export interface RangeFilterSettings extends FilterSettings {
    min: number;
    max: number;
    selectedLow?: number;
    selectedHigh?: number;
}

export class RangeFilter extends Filter {
    rangeValues = ko.observableArray<number>();
    selectedLow = ko.observable<number>();
    selectedHigh = ko.observable<number>();

    constructor(settings: RangeFilterSettings) {
        super({name: settings.name});

        const rangeArray = [];
        for (let i = 0 ; i <= settings.max - settings.min; i++){
            rangeArray.push(settings.min + i);
        }

        this.rangeValues(rangeArray);
        this.selectedLow(settings.selectedLow || settings.min);
        this.selectedHigh(settings.selectedHigh || settings.max);
    }
}
