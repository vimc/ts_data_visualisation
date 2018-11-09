import {DataFilterer} from "../src/DataFilterer";
import {expect} from "chai";

describe("roundDown", () => {

    it("Should round numeric values down to some accuracy", () => {

        const unit = new DataFilterer();

        const e = 1e-6;

        expect(unit.roundDown(-691, 1)).to.equal(-691);

        expect(unit.roundDown(12.3456789, 1)).to.within(10 - e,        10 + e,        "1");
        expect(unit.roundDown(12.3456789, 2)).to.within(12 - e,        12 + e,        "2");
        expect(unit.roundDown(12.3456789, 3)).to.within(12.3 - e,      12.3 + e,      "3");
        expect(unit.roundDown(12.3456789, 4)).to.within(12.34 - e,     12.34 + e,     "4");
        expect(unit.roundDown(12.3456789, 5)).to.within(12.345 - e,    12.345 + e,    "5");
        expect(unit.roundDown(12.3456789, 6)).to.within(12.3456 - e,   12.3456 + e,   "6");
        expect(unit.roundDown(12.3456789, 7)).to.within(12.34567 - e,  12.34567 + e,  "7");
        expect(unit.roundDown(12.3456789, 8)).to.within(12.345678 - e, 12.345678 + e, "8");
    });

});