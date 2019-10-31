import * as $ from "jquery";
import {ImpactDataRow} from "./ImpactDataRow";
import {loadObjectFromJSONFile} from "./Utils";

export interface DataSetUpdate {
    newDataSet: ImpactDataRow[];
    newSeenList: string[];
}

export interface DataSet {
    name: string;
    data: ImpactDataRow[];
    seen: string[];
    prev: string[];
}

export function getDataSet(name: string,
                           sets: DataSet[]): DataSet {
    const ds = sets.find((x) => x.name === name);
    if (ds === null) {
        console.log("No dataset with this name");
    }
    return ds;
}

export function appendToDataSet(toAdd: string[],
                                appendTo: string,
                                dataSets: DataSet[],
                                setPrev: boolean = false,
                                ) {
    const ds = getDataSet(appendTo, dataSets);
    // for each selected touchstone...
    for (const touchstone of toAdd) {
        // ...check if we've already added this data set...
        if (ds.seen.indexOf(touchstone) === -1) {
            // ...if not add it
            // WARNING This file needs to be in same directory otherwise
            // it will break the report on the portal
            const filename = "./impactData_" + touchstone + "_" + appendTo + ".json";
            const newData: ImpactDataRow[] =
                    loadObjectFromJSONFile(filename);

            ds.data = ds.data.concat(newData);
            ds.seen.push(touchstone);
        }
    }

    if (setPrev) {
        ds.prev = toAdd;
    }
}
