import {ImpactDataRow} from "./ImpactDataRow";
const $ = require("jquery");

export interface dataSetUpdate {
    newSeenList: string[];
    newDataSet: ImpactDataRow[];
}

function loadjs(file: string) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = file;
    script.onload = function() {
        console.log("Script is ready!"); 
    };
    document.body.appendChild(script);
 }

export function appendToDataSet(touchstones: string[],
                                seenDataSets: string[],
                                curDataset: ImpactDataRow[]): dataSetUpdate {
    // for each selected touchstone...
    for (let touchstone of touchstones) {
        // ...check if we've already added this data set...
        if (seenDataSets.indexOf(touchstone) == -1) {
            // ...if not add it
            const filename = "./data/impactData_" + touchstone + ".js"
            let newData: ImpactDataRow[] = curDataset; // fail safe in case the file can't be read
            $.ajax({
                'async': false,
                'type': "GET",
                'global': false,
                'contentType': "text/plain",
                'dataType': "text",
                'url': filename,
                'data': { 'request': "", 'target': 'arrange_url', 'method': 'method_target' },
                'success': function (data: string): void {
                    newData = eval(data);
                    return;
                }
            });

            curDataset = curDataset.concat(newData);
            seenDataSets.push(touchstone);
        }
    }
    const update = {
        newSeenList: seenDataSets,
        newDataSet: curDataset
    }
    return update;
}