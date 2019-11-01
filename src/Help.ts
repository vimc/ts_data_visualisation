// generate help title
const impactOptionsHelp: string = "<p><h3>Impact Options</h3></p>" +
    "<p><h4>Compare across </h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Disaggregate by </h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Max bars </h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Metric</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Export as...</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Title</h4>BLAH BLAH BLAH</p>";

export const filterHelp: string =
    "<p><h4>Years</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Activity</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Country</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Disease</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Touchstone</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Support Type</h4>BLAH BLAH BLAH</p>";

const metricBaseHelp: string =
    "<p><h4>Deaths</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Dalys</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>Cases</h4>BLAH BLAH BLAH</p>" +
    "<p><h4>FVPS</h4>BLAH BLAH BLAH</p>";

export function generatedHelpTitle(plot: string): string {
    return plot + " plots";
}

// generate help body
export function generatedHelpBody(plot: string): string {
    if (plot === "Impact") {
        return "The Impact plot is bar chart showing" + impactOptionsHelp
    }

    if (plot === "Time series") {
        return "A timeseries plot is blah blah blah" + impactOptionsHelp
    }

    return "Unkown plot type!"
}

export function generatedMetricsHelp(plot: string) {
    if (plot === "Impact") {
        return metricBaseHelp;
    }

    if (plot === "Time series") {
        return metricBaseHelp +
        "<p><h4>Coverage</h4>BLAH BLAH BLAH</p>" +
        "<p><h4>Deaths (rate)</h4>BLAH BLAH BLAH</p>" +
        "<p><h4>Cases (rate)</h4>BLAH BLAH BLAH</p>";
    }

    return "Unkown plot type!"
}