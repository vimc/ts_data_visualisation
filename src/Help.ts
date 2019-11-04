// generate help title
const impactOptionsHelp: string = "<p><h3>Impact Options</h3></p>" +
    "<p><h4>Compare across </h4>What values should we put along the x-axis</p>" +
    "<p><h4>Disaggregate by </h4>Which variable should we use to disaggregate the bars by.</p>" +
    "<p><h4>Max bars </h4>How many bars should we show along the x axis, this defaults to the maximum</p>" +
    "<p><h4>Metric</h4>Which impact metric to show, for more details see the metridc help</p>" +
    "<p><h4>Export as...</h4>Save the data as a csv or png file. Export all provides the entire dataset as a zip file.</p>" +
    "<p><h4>Title</h4>Supply your own plot title.</p>";

const timeseriesOptionsHelp: string = "<p><h3>Timeseries Options</h3></p>" +
    "<p><h4>Compare across </h4>What values should we put along the x-axis</p>" +
    "<p><h4>Disaggregate by </h4>Which variable should we use to disaggregate the bars by.</p>" +
    "<p><h4>Cumulative </h4>Show a cumulative plot.</p>" +
    "<p><h4>Metric</h4>Which impact metric to show, for more details see the metridc help</p>" +
    "<p><h4>Export as...</h4>Save the data as a csv or png file. Export all provides the entire dataset as a zip file.</p>" +
    "<p><h4>Title</h4>Supply your own plot title.</p>";

export const filterHelp: string =
    "<p><h4>Years</h4>The years for which we show we data the meaning of the year depends on the plot method chosen.</p>" +
    "<p><h4>Activity</h4>The type of vaccination program - routine or combined.</p>" +
    "<p><h4>Country</h4>The countries for which we show the data.</p>" +
    "<p><h4>Disease / Vaccine</h4>The vaccines for which we show the data.</p>" +
    "<p><h4>Touchstone</h4>The touchstone for which we show the data. This should usually be set to the latest touchstone, and selecting multiple touchstone is usually incorrect.</p>" +
    "<p><h4>Support Type</h4>Gavi vs non-Gavi vaccinatio programs</p>";

const metricBaseHelp: string =
    "<p><h4>Deaths</h4>The number of deaths corresponding to that year</p>" +
    "<p><h4>DALYS</h4>Disease affected life years</p>" +
    "<p><h4>Cases</h4>The number of cases corresponding to that year</p>" +
    "<p><h4>FVPS</h4>Fully vaccinated persons</p>";

export function generatedHelpTitle(plot: string): string {
    return plot + " plots";
}

// generate help body
export function generatedHelpBody(plot: string): string {
    if (plot === "Impact") {
        return "The Impact plot is bar chart showing the impact of vaccines" + impactOptionsHelp
    }

    if (plot === "Time series") {
        return "A timeseries plot is a series of data points varying over time" +
               timeseriesOptionsHelp
    }

    return "Unkown plot type!"
}

export function generatedMetricsHelp(plot: string) {
    if (plot === "Impact") {
        return metricBaseHelp;
    }

    if (plot === "Time series") {
        return metricBaseHelp +
        "<p><h4>Coverage</h4>The proportion of the population covered by the vaccine (between 0 an 1)</p>" +
        "<p><h4>Deaths (rate)</h4>The proportion of the population who die (between 0 an 1)</p>" +
        "<p><h4>Cases (rate)</h4>The proportion of the population who will become infected (between 0 an 1)</p>";
    }

    return "Unkown plot type!"
}