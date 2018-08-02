import {RangeFilter} from "../src/Filter";
import {expect} from "chai";

describe("RangeFilter", () => {

    it("Should create range from max and min", () => {

        const sut = new RangeFilter({name: "whatever", min: 2000, max: 2005});

        const expectedRange = [2000,2001,2002,2003,2004,2005];

        expect(sut.rangeValues()).to.have.members(expectedRange);

    })

});