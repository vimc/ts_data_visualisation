import * as ko from "knockout";
import {Sidebar} from "./Sidebar";
import {Plot} from "./Plot";

declare const reportInfo: any;

export class App {

    reportId = ko.observable("Report id: " + reportInfo.rep_id);
    dataId = ko.observable("Data id: " + reportInfo.dep_id);
    appId = ko.observable("App. id: " + reportInfo.git_id);

    sidebar = new Sidebar();
    plot = new Plot(this.sidebar)

}