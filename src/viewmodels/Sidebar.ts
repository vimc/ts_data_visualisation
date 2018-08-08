import * as ko from "knockout";
import {RangeFilter} from "../filtering/RangeFilter";
import {ListFilter} from "../filtering/ListFilter";
import {activityTypes, countries, diseases, vaccines} from "../data/Data";
import {activitiesDict, countryDict, diseaseDict, vaccineDict} from "../data/Dictionaries";
import {CountryFilter} from "../filtering/CountryFilter";

export class Sidebar {
    show = ko.observable<boolean>(true);
    yearFilter = ko.observable(new RangeFilter({
        name: "Years",
        min: 2011,
        max: 2030,
        selectedLow: 2016,
        selectedHigh: 2020
    }));

    activityFilter = ko.observable(new ListFilter({
        name: "Activity",
        options: activityTypes,
        humanNames: activitiesDict
    }));
    countryFilter = ko.observable(new CountryFilter({name: "Country", options: countries, humanNames: countryDict}));
    diseaseFilter = ko.observable(new ListFilter({name: "Disease", options: diseases, humanNames: diseaseDict}));
    vaccineFilter = ko.observable(new ListFilter({name: "Vaccine", options: vaccines, humanNames: vaccineDict}));
}
