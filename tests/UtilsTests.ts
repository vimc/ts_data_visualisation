import {expect} from "chai";
import {touchstoneFriendly} from "../src/Utils";

describe("touchstoneFriendly", () => {
    it("returns empty string if no touchstone provided", () => {
        expect(touchstoneFriendly(undefined)).to.eq("");
        expect(touchstoneFriendly([])).to.eq("");
    });

    it("returns unchanged touchstone if shorter than expected", () => {
        expect(touchstoneFriendly(["test"])).eq("test");
    });

    it("returns unchanged touchstone if month part is not numeric", () => {
        expect(touchstoneFriendly(["2020Q1test"])).to.eq("2021Q1test");
    });

    it("returns friendly touchstone name for WUENIC touchstone", () => {
        expect(touchstoneFriendly(["202110wue"])).to.eq("October 2021 WUENIC");
    });

    it("returns friendly touchstone name for OP touchstone", () => {
        expect(touchstoneFriendly(["202001gavi"])).to.eq("January 2020 OP");
    });

    it("returns unchanged type for unknown touchstone type", () => {
        expect(touchstoneFriendly(["202212test"])).to.eq("December 2022 test");
    });
});
