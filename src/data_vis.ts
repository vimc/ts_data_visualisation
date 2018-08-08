import * as ko from "knockout";
import "chartjs-plugin-datalabels"
import 'bootstrap/dist/css/bootstrap.css';
import {App} from "./viewmodels/App";

require("./index.html");
require("./image/logo-dark-drop.png");
require("./image/caret-down.svg");
require("./image/caret-up.svg");
require("./image/caret-up-dark.svg");
require("./image/caret-up-secondary.svg");
require("./image/caret-down-secondary.svg");
require("./css/styles.css");

const $ = require("jquery");

const viewModel = new App();

ko.applyBindings(viewModel);

$(document).ready(() => {
    viewModel.plot.render();
});

