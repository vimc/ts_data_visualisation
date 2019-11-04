import {generatedHelpBody, generatedHelpTitle, generatedMetricsHelp} from "../src/Help";
import {expect} from "chai";

describe("filterHelp", () => {
    it("generatedHelpBody", () => {

        const help = generatedHelpBody("Hello World!");

        expect(help).to.be.equal("Unkown plot type!");

        const help_2 = generatedHelpBody("Impact");

        expect(help_2).to.have.string("impact plot is bar chart");

        const help_3 = generatedHelpBody("Time series");

        expect(help_3).to.have.string("A timeseries plot is a series");


    })


    it("generatedHelpTitle", () => {

        const help = generatedHelpTitle("Hello World!");

        expect(help).to.be.equal("Hello World! plots");

    })

    it("generatedMetricsHelp", () => {

        const help = generatedMetricsHelp("Hello World!");

        expect(help).to.be.equal("Unkown plot type!");

        const help_2 = generatedMetricsHelp("Impact");

        expect(help_2).to.have.string("Disease affected life years");

        const help_3 = generatedMetricsHelp("Time series");

        expect(help_3).to.have.string("The proportion of the population who die");

    })

});
