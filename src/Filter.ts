import * as ko from "knockout";

import {dove94, dove96, gavi68, gavi72, gavi77, pineCountries} from "./Data";
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
    options: string[];
    selected?: string[];
    humanNames?: { [code: string]: string };
}

export interface CountryFilterSettings extends ListFilterSettings {

}
export interface DiseaseFilterSettings extends FilterSettings {
    vaccineFilters: ListFilter[];
}

export class Filter {
    public isOpen = ko.observable<boolean>(false);
    public name = ko.observable<string>();

    constructor(settings: FilterSettings) {
        this.name(settings.name);
    }

    public toggleOpen() {
        this.isOpen(!this.isOpen());
    }
}

export class ListFilter extends Filter {
    public options = ko.observableArray<string>();
    public selectedOptions = ko.observableArray<string>();
    private dictionary: { [code: string]: string };

    constructor(settings: ListFilterSettings) {
        super({name: settings.name});
        this.options(settings.options);
        this.selectedOptions(settings.selected || settings.options);
        this.dictionary = settings.humanNames;
    }

    public makeHumanreadable(code: string): string {
        return this.dictionary[code];
    }
}

export class CountryFilter extends ListFilter {
    constructor(settings: CountryFilterSettings) {
        super(settings);
        this.options(settings.options);
        this.selectedOptions(settings.selected || settings.options);
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
            case "dove94":
                this.selectedOptions([...dove94]);
                break;
            case "dove96":
                this.selectedOptions([...dove96]);
                break;
            case "gavi77":
                this.selectedOptions([...gavi77]);
                break;
            case "gavi72":
                this.selectedOptions([...gavi72]);
                break;
            case "gavi68":
                this.selectedOptions([...gavi68]);
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
    public rangeValues = ko.observableArray<number>();

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
    public selectedOptions = ko.observableArray([]);
    private vaccineFilters: ListFilter[] = [];

    constructor(settings: DiseaseFilterSettings) {
        super(settings);
        this.vaccineFilters = settings.vaccineFilters;
        this.updateSelectedOptions();
        this.vaccineFilters.map((f) => {
            f.selectedOptions.subscribe(() => {
                this.updateSelectedOptions();
            });
        });
    }

    public selectNoVaccines() {
        console.log("selectNoVaccines")
        this.selectedOptions(
            this.vaccineFilters.map((v) => v.selectedOptions([])));
        this.updateSelectedOptions();
    }

    public selectAllVaccines() {
        console.log("selectAllVaccines")
        this.selectedOptions(this.vaccineFilters
            .map((v) => v.selectedOptions(v.options())));
        this.updateSelectedOptions();
    }

    private updateSelectedOptions = () => {
         this.selectedOptions(this.vaccineFilters.map((v) => v.selectedOptions()).reduce((x, y) => x.concat(y), []));
    }
}
