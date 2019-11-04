import * as ko from "knockout";

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
    groups?: { [code: string]: string[] };
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
    private groups: { [code: string]: string[] };

    constructor(settings: CountryFilterSettings) {
        super(settings);
        this.groups = settings.groups;
        this.options(settings.options || []);
        this.selectedOptions(settings.selected || settings.options);
    }

    public selectCountryGroup(selectedGroup: string) {
        if (selectedGroup === "all") {
            this.selectedOptions([...this.options()]);
        } else if (selectedGroup === "none") {
            this.selectedOptions([]);
        } else if (this.groups[selectedGroup] !== undefined) {
            this.selectedOptions(this.groups[selectedGroup]);
        } else {
            console.log("Warning: Country group " + selectedGroup + " does not exist") 
            this.selectedOptions([]);
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

    private updateSelectedOptions = () => {
         this.selectedOptions(this.vaccineFilters.map((v) => v.selectedOptions()).reduce((x, y) => x.concat(y), []));
    }
}
