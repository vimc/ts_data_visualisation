import * as ko from "knockout";

import {countries, gavi69, gavi73, pineCountries} from "./Data";
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
    private isOpen = ko.observable<boolean>(false);
    private name = ko.observable<string>();

    constructor(settings: FilterSettings) {
        this.name(settings.name);
    }

    public toggleOpen() {
        this.isOpen(!this.isOpen());
    }
}

export class ListFilter extends Filter {
    options = ko.observableArray<string>();
    selectedOptions = ko.observableArray<string>();
    dictionary: { [code: string]: string };

    constructor(settings: ListFilterSettings) {
        super({name: settings.name});
        this.options(settings.options);
        this.selectedOptions(settings.selected || settings.options);
        this.dictionary = settings.humanNames;
    }

    public makeHumanreadable(code: string): string {
        if (this.dictionary) {
            return this.dictionary[code];
        }

        return null;
    }
}

export class CountryFilter extends ListFilter {
    constructor(settings: CountryFilterSettings) {
        super(settings);
        this.options(settings.options);
        this.selectedOptions(settings.selected || settings.options);

        this.selectCountryGroup("pine");
    }

    public selectCountryGroup(selectedGroup: string) {
        switch (selectedGroup) {
            case "all":
                this.selectedOptions([...this.options()]);
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
}

export class RangeFilter extends Filter {
    public selectedLow = ko.observable<number>();
    public selectedHigh = ko.observable<number>();
    private rangeValues = ko.observableArray<number>();

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
