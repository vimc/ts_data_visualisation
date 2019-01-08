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
            console.log(filename);
/*            const newData = $.get(filename, function(data: ImpactDataRow[]) :ImpactDataRow[] {
              return data;
            }, "script");*/

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
//                    console.log(filename)
//                    console.log(data)
//                    const temp = eval(data);
//                    console.log(temp.length)
//                    console.log(temp[0])
                    newData = eval(data);
                    return;
                }
            });

/*            var x = new XMLHttpRequest();
            x.open('GET', filename);
            x.onreadystatechange = function() {
              alert(x.responseText);
            }
            x.send();*/
            curDataset = curDataset.concat(newData);
            seenDataSets.push(touchstone);

            console.log(newData.length)
        }
    }

    const update = {
        newSeenList: seenDataSets,
        newDataSet: curDataset
    }
    return update;
}