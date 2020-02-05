/*
 * This file contains the logic for the filters - i.e. the UI objects that allow
 * the use to input their filter options
*/

import * as ko from "knockout";

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
/*
 * This is the base class, it does nothing an only has a name member variable
 * denoting whether or not it is open. Nothing should ever use this filter - we
 * only export it so that it can be tested.
 */
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

/*
 * This is filter has a list of options and a sub list of selected options.
 * Options are (de-)selected via a checkbox
 */
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

  // sometimes the options use a shortened code and we need to translate it to
  // something readable (e.g. IND vs India)
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

/*
 * This is filter has a list of options and a sub list of selected options.
 * Options are (de-)selected via a checkbox. It also has functionality to select
 * groups of options by a button/member function.
 * This probably should be renamed e.g. GroupedListFilter and some other
 * renaming since it does need to be restricted to countries.
 */
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

/*
 * This filter is for a numberic variable e.g. year. The user select two numbers
 * a lower and upper bound. We do not ensure that the lower<upper, this is done
 * by the app itself
 */
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

/*
 * This filter has nested lists where each of the top options has list of
 * sub-options. We use it for diseases and vaccines e.g.
 * Measles
 *  |_Measle_Vac_1
 *  |_Measle_Vac_2
 * HepB
 *  |_HepB_Vac_1
 *  |_HepB_Vac_2
 * JE
 *  |_JE_Vac
 *
 * We could rename this NestedListFilter since it does not have to apply to
 * disease/vaccines.
 */
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
     this.selectedOptions(this.vaccineFilters.map(
        (v) => v.selectedOptions()).reduce((x, y) => x.concat(y), []));
  }
}
