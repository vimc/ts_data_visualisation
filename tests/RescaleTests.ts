import {rescaleLabel} from "../src/Chart";
import {DataFilterer} from "../src/DataFilterer";
import {expect} from "chai";

describe("rescaleLabels", () => {

    it("Should produce human-readable strings with units", () => {

        expect(rescaleLabel(0.1, 0.1)).to.equal("0.1");
        expect(rescaleLabel(-1, -1)).to.equal("-1");

        expect(rescaleLabel(1, 1)).to.equal("1");
        expect(rescaleLabel(12, 12)).to.equal("12");
        expect(rescaleLabel(123, 123)).to.equal("123");
        expect(rescaleLabel(1234, 1234)).to.equal("1.23K");
        expect(rescaleLabel(12345, 12345)).to.equal("12.3K");
        expect(rescaleLabel(123456, 123456)).to.equal("123K");
        expect(rescaleLabel(1234567, 1234567)).to.equal("1.23M");
        expect(rescaleLabel(12345678, 12345678)).to.equal("12.3M");
        expect(rescaleLabel(123456789, 123456789)).to.equal("123M");
        expect(rescaleLabel(1234567890, 1234567890)).to.equal("1.23B");

        expect(rescaleLabel(123456, 0.1)).to.equal("123456");
        expect(rescaleLabel(123456, 1)).to.equal("123456")
        expect(rescaleLabel(123456, 10)).to.equal("123456")
        expect(rescaleLabel(123456, 10000)).to.equal("123K")
        expect(rescaleLabel(123456, 10000000)).to.equal("0.123M")
        expect(rescaleLabel(123456, 10000000000)).to.equal("0.000123B")
    });

});