import * as ko from "knockout";

// for country filters
import {countries, pineCountries, gavi69, gavi73} from "./Data";
import {diseaseDict} from "./Dictionaries";

export interface FilterSettings {
    name: string;
}

export interface RangeFilterSettings extends FilterSettings {
    min: number;
    max: number;
    selectedLow?: number;
    selectedHigh?: number;
}

export interface ListFilterSettings extends FilterSettings {
    options: Array<string>;
    selected?: Array<string>;
    humanNames?: { [code: string]: string }
}

export interface CountryFilterSettings extends ListFilterSettings {

}

export class Filter {
    isOpen = ko.observable<boolean>(false);
    name = ko.observable<string>();

    toggleOpen() {
        this.isOpen(!this.isOpen());
    }

    constructor(settings: FilterSettings) {
        this.name(settings.name);
    }
}

export class ListFilter extends Filter {
    options = ko.observableArray<string>();
    selectedOptions = ko.observableArray<string>();
    dictionary: { [code: string]: string };

    makeHumanreadable(code: string): string {
        if (this.dictionary)
            return this.dictionary[code];

        return null;
    }

    constructor(settings: ListFilterSettings) {
        super({name: settings.name});
        this.options(settings.options);
        this.selectedOptions(settings.selected || settings.options);
        this.dictionary = settings.humanNames;
    }
}

export class CountryFilter extends ListFilter {
    selectCountryGroup(selectedGroup: string) {
        switch (selectedGroup) {
            case "all":
                this.selectedOptions(this.options());
                break;
            case "none":
                this.selectedOptions([]);
                break;
            case "pine":
                this.selectedOptions([...pineCountries]);
                break;
            case "gavi73":
                this.selectedOptions([...gavi73]);
                break;
            case "gavi69":
                this.selectedOptions([...gavi69]);
                break;
            default:
                this.selectedOptions([]);
                break;
        }
    }

    constructor(settings: CountryFilterSettings) {
        super(settings);
        this.options(settings.options);
        this.selectedOptions(settings.selected || settings.options);

        this.selectCountryGroup("pine");
    }
}

export class RangeFilter extends Filter {
    rangeValues = ko.observableArray<number>();
    selectedLow = ko.observable<number>();
    selectedHigh = ko.observable<number>();

    constructor(settings: RangeFilterSettings) {
        super({name: settings.name});

        const rangeArray = [];
        for (let i = 0; i <= settings.max - settings.min; i++) {
            rangeArray.push(settings.min + i);
        }

        this.rangeValues(rangeArray);
        this.selectedLow(settings.selectedLow || settings.min);
        this.selectedHigh(settings.selectedHigh || settings.max);
    }
}

export class DiseaseFilter extends Filter {
    vaccineFilters: ListFilter[] = [];
    selectedOptions = ko.observableArray([]);

    updateSelectedOptions = () => {
         this.selectedOptions(this.vaccineFilters.map((v) => v.selectedOptions()).reduce((x, y) => x.concat(y), []))
    };

    constructor(settings: any) {
        super(settings);
        this.vaccineFilters = settings.vaccineFilters;
        this.updateSelectedOptions();
        this.vaccineFilters.map((f) => {
            f.selectedOptions.subscribe(() => {
                this.updateSelectedOptions()
            })
        })
    }
}
