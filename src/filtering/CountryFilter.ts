import {gavi69, gavi73, pineCountries} from "../data/Data";
import {ListFilter, ListFilterSettings} from "./ListFilter";
import * as ko from "knockout";

export class CountryFilter extends ListFilter {

    optionNames = ko.observableArray<string>();

    selectCountryGroup(selectedGroup: string) {
        switch(selectedGroup) {
            case "all":
                this.selectedOptions(this.optionNames());
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
                this.selectedOptions([]);
                break;
        }
    }

    constructor(settings: ListFilterSettings) {
        super(settings);
        this.optionNames(settings.options);

        this.selectCountryGroup("pine");
    }
}