import * as $ from "jquery";
import {ImpactDataRow} from "./ImpactDataRow";

export interface DataSetUpdate {
    newDataSet: ImpactDataRow[];
    newSeenList: string[];
}

export function appendToDataSet(touchstones: string[],
                                seenDataSets: string[],
                                curDataset: ImpactDataRow[]): DataSetUpdate {
    // for each selected touchstone...
    for (const touchstone of touchstones) {
        // ...check if we've already added this data set...
        if (seenDataSets.indexOf(touchstone) === -1) {
            // ...if not add it
            const filename = "./impactData_" + touchstone + ".js";

            let newData: ImpactDataRow[] = []; // fail safe in case the file can't be read
            $.ajax({
                async: false,
                contentType: "text/plain",
                data: { request: "", target: "arrange_url", method: "method_target" },
                dataType: "text",
                global: false,
                success: (data: string) => {
                    newData = eval(data);
                    return;
                },
                type: "GET",
                url: filename,
            });

            curDataset = curDataset.concat(newData);
            seenDataSets.push(touchstone);
        }
    }
    const update = {
        newDataSet: curDataset,
        newSeenList: seenDataSets,
    };
    return update;
}
