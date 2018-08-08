import {Filter, FilterSettings} from "./Filter";
import * as ko from "knockout";

export interface ListFilterSettings extends FilterSettings {
    options: Array<string>;
    selected?: Array<string>;
    humanNames: { [code: string] : string }
}

export class ListFilterOption {
    name = ko.observable<string>();
    humanReadableName = ko.observable<string>();

    constructor(name: string, dictionary: { [code: string] : string }){
        this.name(name);
        this.humanReadableName(dictionary[name]);
    }
}

export class ListFilter extends Filter {

    options = ko.observableArray<ListFilterOption>();
    selectedOptions = ko.observableArray<string>();

    constructor(settings: ListFilterSettings) {
        super({name: settings.name});
        this.options(settings.options.map((o) => new ListFilterOption(o, settings.humanNames)));
        this.selectedOptions(settings.selected || settings.options);
    }
}
