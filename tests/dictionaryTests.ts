import * as ut from "../src/Utils"
import * as sinon from "sinon";
// mock here
const stub = sinon.stub(ut, 'loadObjectFromJSONFile');
stub.returns([
    {"country":"FJI","country_name":"Fiji"},
    {"country":"GMB","country_name":"Gambia"},
    {"country":"GEO","country_name":"Georgia"},
    {"country":"GHA","country_name":"Ghana"},
    {"country":"GTM","country_name":"Guatemala"},
    {"country":"GIN","country_name":"Guinea"},
    {"country":"GNB","country_name":"Guinea-Bissau"},
    {"country":"GUY","country_name":"Guyana"},
    {"country":"HTI","country_name":"Haiti"},
    {"country":"HND","country_name":"Honduras"},
    {"country":"IND","country_name":"India"},
    {"country":"COD","country_name":"DR Congo"},
    {"country":"MMR","country_name":"Myanmar"},
    {"country":"BIH","country_name":"Bosnia and Herzegovina"},
    {"country":"KGZ","country_name":"Kyrgyzstan"},
    {"country":"PNG","country_name":"Papua New Guinea"},
    {"country":"PAK","country_name":"Pakistan"},
]);

import {countryDict, countryCodeToName, vaccineCodeToName, diseaseCodeToName, diseaseVaccineLookup} from "../src/Dictionaries";
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

stub.restore();
