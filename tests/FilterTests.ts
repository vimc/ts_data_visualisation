import * as sinon from "sinon";

import {CountryFilter, VaccineDiseaseFilter, Filter, ListFilter, RangeFilter} from "../src/Filter";
import {countries, countryGroups, fakeCountryDict} from "../scripts/fakeVariables";
import {parseIntoDictionary} from "../src/Utils";
import {expect} from "chai";

describe("RangeFilter", () => {

    it("Should create range from max and min", () => {

        const sut = new RangeFilter({name: "whatever", min: 2000, max: 2005});

        const expectedRange = [2000,2001,2002,2003,2004,2005];

        expect(sut.rangeValues()).to.have.members(expectedRange);

    })

});

describe("toggleOpen", () => {

    it("Should toggle the isOpen propertt", () => {

        const sut = new Filter({name: "whatever"});

        // starts out closed
        expect(sut.isOpen()).to.be.false;
        sut.toggleOpen();
        // toggle to open
        expect(sut.isOpen()).to.be.true;
    })

});

describe("ListFilter", () => {

    it("Check ListFilter member variables are set correctly", () => {

        const sut = new ListFilter({name: "whatever",
                                    options: ["a", "b", "c"],
                                    selected: ["a", "c"],
                                    humanNames: {"a": "cat", "b": "dog", "c": "fish"}
                                  });

        expect(sut.options()).to.have.members(["a", "b", "c"]);

        expect(sut.selectedOptions()).to.have.members(["a", "c"]);

        expect(sut.makeHumanreadable("b")).to.equal("dog");

        expect(sut.makeHumanreadable("d")).to.be.undefined;
    })

    it("Check ListFilter no selected option", () => {

        const sut = new ListFilter({name: "whatever",
                                    options: ["a", "b", "c"],
                                    humanNames: {"a": "cat", "b": "dog", "c": "fish"}
                                  });

        expect(sut.selectedOptions()).to.have.members(["a", "b", "c"]);
    })

});

describe("CountryFilter", () => {

    it("Check CountryFilter member variables are set correctly", () => {

        const sut = new CountryFilter({groups: countryGroups,
                                       name: "whatever",
                                       options: countries,
                                       selected: ["KIR"],
                                       humanNames: parseIntoDictionary(fakeCountryDict, "country", "country_name")
                                      });
        expect(sut.selectedOptions()).to.have.members(["KIR"]);
        expect(sut.options()).to.have.members(countries);

        expect(sut.makeHumanreadable("PAK")).to.equal("Pakistan");

        expect(sut.makeHumanreadable("FISH")).to.be.undefined;

        sut.selectCountryGroup("all");
        expect(sut.selectedOptions()).to.have.members(countries);

        sut.selectCountryGroup("none");
        expect(sut.selectedOptions()).to.have.members([]);

        sut.selectCountryGroup("pine");
        expect(sut.selectedOptions()).to.have.members(countryGroups["pine"]);

        sut.selectCountryGroup("dove94");
        expect(sut.selectedOptions()).to.have.members(countryGroups["dove94"]);

        sut.selectCountryGroup("dove96");
        expect(sut.selectedOptions()).to.have.members(countryGroups["dove96"]);

        sut.selectCountryGroup("dove94");
        expect(sut.selectedOptions()).to.have.members(countryGroups["dove94"]);

        sut.selectCountryGroup("gavi72");
        expect(sut.selectedOptions()).to.have.members(countryGroups["gavi72"]);

        let spy = sinon.spy(console, 'log');      

        sut.selectCountryGroup("FISH");
        sinon.assert.calledWith(spy, "Warning: Country group FISH does not exist");
        expect(sut.selectedOptions()).to.have.members([]);
        
        spy.restore();
    })

    it("Check CountryFilter no selected option", () => {
        const sut = new CountryFilter({name: "whatever",
                                       options: countries,
                                       humanNames: parseIntoDictionary(fakeCountryDict, "country", "country_name")
                                      });

        expect(sut.selectedOptions()).to.have.members(countries);
    })
});

describe("Disease-Vaccine filter", () => {
        const f1 = new ListFilter({name: "filter1",
                                    options: ["aa", "ab", "ac"],
                                    humanNames: {"aa": "cat", "ab": "dog", "ac": "fish"},
                                    selected: ["aa"]
                          });
        const f2 = new ListFilter({name: "filter2",
                            options: ["bb"],
                            humanNames: {"bb": "filter3"},
                            selected: ["bb"]
                          });
        const f3 = new ListFilter({name: "disease3",
                    options: ["ca", "cb"],
                    humanNames: {"ca": "frog", "cb": "camel"}
                  });

        const filterArray = [f1, f2, f3];

        const sut = new VaccineDiseaseFilter({name: "whatever",
                                       vaccineFilters: filterArray
                                     });

    it("make sure initial selection is correct", () => {
        expect(sut.selectedOptions()).to.have.members(["aa", "bb", "ca", "cb"]);
    })
        
});
