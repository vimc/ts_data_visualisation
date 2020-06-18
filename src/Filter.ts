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

  public selectAll() {
    this.selectedOptions(this.options());
  }

  public selectNone() {
    this.selectedOptions([]);
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
      this.selectAll();
    } else if (selectedGroup === "none") {
      this.selectNone();
    } else if (this.groups[selectedGroup] !== undefined) {
      this.selectedOptions(this.groups[selectedGroup]);
    } else {
      console.log("Warning: Country group " + selectedGroup + " does not exist");
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

const allDiseases = "All Diseases";
const allDiseasesVaccine = "All Diseases";
export class DiseaseFilter extends ListFilter {
  private unaggregatedSelections: string[] = [];

  constructor(settings: ListFilterSettings) {
    super(settings);
    if (this.options.indexOf(allDiseases) > -1) {
      this.selectedOptions([allDiseases]);
      this.unaggregatedSelections = this.allUnaggregatedOptions();
    }
  }

  public displayDiseaseFilter = (disease: string) => disease !== allDiseases;

  public get displayAggregateAll() {
    return this.options.indexOf(allDiseases) > -1;
  }

  public get aggregateAll() {
    return this.selectedOptions.indexOf(allDiseases) > -1;
  }

  public set aggregateAll(value) {

    if (value) {
      // save previously selected vaccines so we can restore later
      this.unaggregatedSelections = [...this.selectedOptions()];
      this.selectedOptions([allDiseases]);
    } else {
      this.selectedOptions([...this.unaggregatedSelections]);
    }
  }

  public selectAll() {
    this.selectedOptions(this.allUnaggregatedOptions());
  }

  private allUnaggregatedOptions = () => this.options().filter((f) => f !== allDiseases);
}

export class VaccineDiseaseFilter extends Filter {
  public selectedOptions = ko.observableArray([]);
  private vaccineFilters: ListFilter[] = [];
  private unaggregatedSelections: { [disease: string]: string[] } = {};

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

  public displayVaccineFilter = (disease: string) => {
    return disease !== allDiseases;
  }

  public get displayAggregateAll() {
    return !!this.vaccineFilters.find((f) => f.name() === allDiseases);
  }

  public get aggregateAll() {
    return this.selectedOptions.indexOf(allDiseasesVaccine) > -1;
  }

  public set aggregateAll(value) {
    if (value) {
      this.vaccineFilters.forEach((f) => {
        // save previously selected vaccines so we can restore later
        this.unaggregatedSelections[f.name()] = [...f.selectedOptions()];
      });
      this.vaccineFilters.forEach((f) => {
        f.selectedOptions(f.name() === allDiseases ? [allDiseasesVaccine] : []);
      });
    } else {
      // restore previously selected vaccines
      this.vaccineFilters.forEach((f) => {
        f.selectedOptions(this.unaggregatedSelections[f.name()] || []);
      });
    }
  }

  private updateSelectedOptions = () => {
     this.selectedOptions(this.vaccineFilters.map((v) => v.selectedOptions()).reduce((x, y) => x.concat(y), []));
  }
}
