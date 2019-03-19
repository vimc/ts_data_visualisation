import {countryCodeToName, vaccineCodeToName, diseaseCodeToName, diseaseVaccineLookup} from "../src/Dictionaries";
import {expect} from "chai";

describe("countryCodeToName", () => {

    it("Should return the correct country name", () => {

        const name1: string = countryCodeToName("BIH");
        expect(name1).to.have.string('Bosnia');
        expect(name1).to.have.string('and');
        expect(name1).to.have.string('Herzegovina');

        const name2: string = countryCodeToName("KGZ");
        expect(name2).to.have.string('Kyrgyzstan');

        const name3: string = countryCodeToName("PNG");
        expect(name3).to.have.string('Papua');
        expect(name3).to.have.string('New');
        expect(name3).to.have.string('Guinea');

        const name4: string = countryCodeToName("123");
        expect(name4).to.be.undefined;
    })
});

describe("vaccineCodeToName", () => {

    it("Should return the correct vaccine name", () => {

        const name1: string = vaccineCodeToName("HPV");
        expect(name1).to.have.string('HPV');

        const name2: string = vaccineCodeToName("MCV1");
        expect(name2).to.have.string('MCV1');

        const name3: string = vaccineCodeToName("JE");
        expect(name3).to.have.string('Japanese');
        expect(name3).to.have.string('encephalitis');

        const name4: string = vaccineCodeToName("123");
        expect(name4).to.be.undefined;
    })
});

describe("diseaseCodeToName", () => {

    it("Should return the correct disease names", () => {

        const name1: string = diseaseCodeToName("HPV");
        expect(name1).to.have.string('HPV');

        const name2: string = diseaseCodeToName("Rota");
        expect(name2).to.have.string('Rotavirus');

        const name3: string = diseaseCodeToName("YF");
        expect(name3).to.have.string('Yellow');
        expect(name3).to.have.string('Fever');

        const name4: string = diseaseCodeToName("123");
        expect(name4).to.be.undefined;
    })
});
