import {CountryFilter, DiseaseFilter, Filter, ListFilter, RangeFilter} from "../src/Filter";
import {countries, pineCountries, gavi69, gavi73} from "../src/Data";
import {countryCodeToName, countryDict,} from "../src/Dictionaries"
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

        const sut = new CountryFilter({name: "whatever",
                                    options: countries,
                                    selected: ["KIR"],
                                    humanNames: countryDict
                                  });

        expect(sut.options()).to.have.members(countries);

        // initialises to PINE countries
        expect(sut.selectedOptions()).to.have.members(pineCountries);

        expect(sut.makeHumanreadable("PAK")).to.equal("Pakistan");

        expect(sut.makeHumanreadable("FISH")).to.be.undefined;

        sut.selectCountryGroup("all");
        expect(sut.selectedOptions()).to.have.members(countries);

        sut.selectCountryGroup("none");
        expect(sut.selectedOptions()).to.have.members([]);

        sut.selectCountryGroup("gavi73");
        expect(sut.selectedOptions()).to.have.members(gavi73);

        sut.selectCountryGroup("gavi69");
        expect(sut.selectedOptions()).to.have.members(gavi69);

        sut.selectCountryGroup("FISH");
        expect(sut.selectedOptions()).to.have.members([]);

    })

    it("Check CountryFilter no selected option", () => {
        const sut = new CountryFilter({name: "whatever",
                                       options: countries,
                                       humanNames: countryDict
                                      });

        expect(sut.selectedOptions()).to.have.members(pineCountries);
    })
});
