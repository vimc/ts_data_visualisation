import * as ko from "knockout";

export interface FilterSettings {
    name: string;
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