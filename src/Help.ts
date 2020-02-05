/**
 * This file contains the code for dynamically creating help messages as strings
 */


// generate help title
const impactOptionsHelp: string = "<p><h3>Impact Options</h3></p>" +
  "<p><h4>Compare across </h4>What values should we put along the x-axis</p>" +
  "<p><h4>Stratify by </h4>Which variable should we use to disaggregate the bars by.</p>" +
  "<p><h4>Max bars </h4>How many bars should we show along the x axis, this defaults to the maximum</p>" +
  "<p><h4>Metric</h4>Which impact metric to show, for more details see the metric help</p>" +
  "<p><h4>Export as...</h4>Save the data as a csv or png file. Export all provides the entire dataset as a zip file.</p>" +
  "<p><h4>Title</h4>Supply your own plot title.</p>";

const timeseriesOptionsHelp: string = "<p><h3>Timeseries Options</h3></p>" +
  "<p><h4>Disaggregate by </h4>Which variable should we use to disaggregate the bars by.</p>" +
  "<p><h4>Cumulative </h4>Show a cumulative plot.</p>" +
  "<p><h4>Cumulative </h4>Show 95% condifence intervals (only available when stratifying by disease).</p>" +
  "<p><h4>Metric</h4>Which impact metric to show, for more details see the metric help</p>" +
  "<p><h4>Export as...</h4>Save the data as a csv or png file. Export all provides the entire dataset as a zip file.</p>" +
  "<p><h4>Title</h4>Supply your own plot title.</p>";

export const filterHelp: string =
  "<p><h4>Years</h4>The years for which we show the data. The meaning of the year depends on the plot method chosen.</p>" +
  "<p><h4>Activity</h4>The type of vaccination program - routine or campaign.</p>" +
  "<p><h4>Country</h4>The countries for which we show the data.</p>" +
  "<p><h4>Disease / Vaccine</h4>The vaccines for which we show the data.</p>" +
  "<p><h4>Touchstone</h4>The touchstone for which we show the data. This should usually be set to the latest touchstone, and selecting multiple touchstone is usually incorrect.</p>" +
  "<p><h4>Support Type</h4>Gavi vs non-Gavi vaccination programs</p>";

export function generatedHelpTitle(plot: string): string {
  return plot + " plots";
}

// generate help body
export function generatedHelpBody(plot: string): string {
  if (plot === "Impact") {
    return "The impact plot is a bar chart showing the impact of vaccines" + impactOptionsHelp;
  }

  if (plot === "Time series") {
    return "A timeseries plot is a series of data points varying over time" +
         timeseriesOptionsHelp;
  }

  return "Unkown plot type!";
}

export function generatedMetricsHelp(plot: string, visible: string[]) {
  if ((plot !== "Impact") && (plot !== "Time series")) {
    return "Unkown plot type!";
  }

  let returnString: string  = "";

  if (visible.includes("deaths")) {
    returnString =
      returnString.concat("<p><h4>Deaths</h4>The number of deaths " +
                          "corresponding to that year.</p>");
  }
  if (visible.includes("deaths_averted")) {
    returnString =
      returnString.concat("<p><h4>Deaths averted</h4>The number of deaths " +
                          "averted corresponding to that year.</p>");
  }
  if (visible.includes("dalys")) {
    returnString =
      returnString.concat("<p><h4>DALYs</h4>The number of disease affected " +
                          "life years corresponding to that year.</p>");
  }
  if (visible.includes("dalys_averted")) {
    returnString =
      returnString.concat("<p><h4>DALYs averted</h4>The number of disease " +
                          "affected life years averted corresponding to that " +
                          "year.</p>");
  }
  if (visible.includes("cases")) {
    returnString =
      returnString.concat("<p><h4>Cases</h4>The number of cases " +
                          "corresponding to that year.</p>");
  }
  if (visible.includes("cases_averted")) {
    returnString =
      returnString.concat("<p><h4>Cases averted</h4>The number of cases " +
                          "averted corresponding to that year.</p>");
  }
  if (visible.includes("fvps")) {
    returnString =
      returnString.concat("<p><h4>FVPs</h4>Fully vaccinated persons</p>");
  }
  if (visible.includes("coverage")) {
    returnString =
      returnString.concat("<p><h4>Coverage</h4>The proportion of the " +
                          "population covered by the vaccine (between 0 and " +
                          "1).</p>");
  }
  if (visible.includes("deaths_averted_rate")) {
    returnString =
      returnString.concat("<p><h4>Deaths (rate)</h4>The proportion of the " +
                          "vaccinated population who die of the disease " +
                          "(between 0 an 1).</p>");
  }
  if (visible.includes("cases_averted_rate")) {
    returnString =
      returnString.concat("<p><h4>Cases (rate)</h4>The proportion of the " +
                          "vaccinated population who will become infected" +
                          "with the disease (between 0 an 1).</p>");
  }

  return returnString;
}
