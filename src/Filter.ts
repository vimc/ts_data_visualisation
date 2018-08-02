import * as ko from "knockout";

// for country filters
import {countries, pineCountries, gavi69, gavi73} from "./Data";

export interface FilterOptions {
    name: string;
}

export interface RangeFilterOptions extends FilterOptions {
    min: number;
    max: number;
    selectedLow?: number;
    selectedHigh?: number;
}

export interface ListFilterOptions extends FilterOptions {
    options: Array<string>;
    selected?: Array<string>;
    humanNames?: { [code: string] : string }
}

export interface CountryFilterOptions extends ListFilterOptions {

}

export class Filter {
    isOpen = ko.observable<boolean>(false);
    name = ko.observable<string>();

    toggleOpen() {
        this.isOpen(!this.isOpen());
    }

    constructor(options: FilterOptions) {
        this.name(options.name);
    }
}

export class ListFilter extends Filter {
    options = ko.observableArray<string>();
    selectedOptions = ko.observableArray<string>();
    dictionary: { [code: string] : string };

    makeHumanreadable(code: string): string {
        if (this.dictionary)
            return this.dictionary[code];

        return null;
    }

    constructor(options: ListFilterOptions) {
        super({name: options.name});
        this.options(options.options);
        this.selectedOptions(options.selected || options.options);
        this.dictionary = (options.humanNames || options.humanNames);
    }
}

export class CountryFilter extends ListFilter {
    selectCountryGroup(cntGrp: string) {
        switch(cntGrp) {
            case "all":
                this.selectedOptions(this.options());
                break;
            case "none":
                this.selectedOptions([]);
                break;
            case "pine":
                this.selectedOptions(pineCountries);
                break;
            case "gavi73":
                this.selectedOptions(gavi73);
                break;
            case "gavi69":
                this.selectedOptions(gavi69);
                break;
            default:
                console.debug(cntGrp);
                this.selectedOptions([]);
                break;
        }
    }

    constructor(options: CountryFilterOptions) {
        super(options);
        this.options(options.options);
        this.selectedOptions(options.selected || options.options);
    }
}

export class RangeFilter extends Filter {
    rangeValues = ko.observableArray<number>();
    selectedLow = ko.observable<number>();
    selectedHigh = ko.observable<number>();

    constructor(options: RangeFilterOptions) {
        super({name: options.name});

        const rangeArray = [];
        for (let i = 0 ; i <= options.max - options.min; i++){
            rangeArray.push(options.min + i);
        }

        this.rangeValues(rangeArray);
        this.selectedLow(options.selectedLow || options.min);
        this.selectedHigh(options.selectedHigh || options.max);
    }
}
