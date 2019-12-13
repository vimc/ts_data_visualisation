import {generatedHelpBody, generatedHelpTitle, generatedMetricsHelp} from "../src/Help";
import {expect} from "chai";

describe("filterHelp", () => {
    it("generatedHelpBody", () => {

        const help = generatedHelpBody("Hello World!");

        expect(help).to.be.equal("Unkown plot type!");

        const help_2 = generatedHelpBody("Impact");

        expect(help_2).to.have.string("The impact plot is a bar chart");

        const help_3 = generatedHelpBody("Time series");

        expect(help_3).to.have.string("A timeseries plot is a series");


    })


    it("generatedHelpTitle", () => {

        const help = generatedHelpTitle("Hello World!");

        expect(help).to.be.equal("Hello World! plots");

    })

    it("generatedMetricsHelp", () => {

        const help = generatedMetricsHelp("Hello World!",[]);

        expect(help).to.be.equal("Unkown plot type!");

        const help_2 = generatedMetricsHelp("Impact",["deaths", "dalys", "cases", "fvps"]);

        expect(help_2).to.have.string("The number of deaths corresponding ");
        expect(help_2).to.have.string("disease affected life years");
        expect(help_2).to.have.string("The number of cases corresponding");
        expect(help_2).to.have.string("Fully vaccinated persons");

        const help_3 = generatedMetricsHelp("Time series",["deaths_averted","dalys_averted", "cases_averted"]);

        expect(help_3).to.have.string("The number of deaths averted");
        expect(help_3).to.have.string("The number of disease affected life years averted");
        expect(help_3).to.have.string("The number of cases averted");

        const help_4 = generatedMetricsHelp("Time series",["coverage","deaths_averted_rate", "cases_averted_rate"]);

        expect(help_4).to.have.string("The proportion of the population covered by the vaccine");
        expect(help_4).to.have.string("the vaccinated population who die of the");
        expect(help_4).to.have.string("vaccinated population who will become infected");
    })

});
