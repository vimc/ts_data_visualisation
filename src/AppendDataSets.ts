import * as $ from "jquery";
import {ImpactDataRow} from "./ImpactDataRow";
import {loadObjectFromJSONFile} from "./Utils";

export interface DataSetUpdate {
    newDataSet: ImpactDataRow[];
    newSeenList: string[];
}

export interface DataSet {
    name: string,
    data: ImpactDataRow[],
    seen: string[]
}

export function appendToDataSet(touchstones: string[],
                                seenDataSets: string[],
                                curDataset: ImpactDataRow[]): DataSetUpdate {
    // for each selected touchstone...
    for (const touchstone of touchstones) {
        // ...check if we've already added this data set...
        if (seenDataSets.indexOf(touchstone) === -1) {
            // ...if not add it
            // WARNING This file needs to be in same directory otherwise
            // it will break the report on the portal
            const filename = "./impactData_" + touchstone + "_method_2.json";
            const newData: ImpactDataRow[] =
                    loadObjectFromJSONFile(filename);

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

export function getSingleDataSet(filename: string) {
    const newData: ImpactDataRow[] = loadObjectFromJSONFile(filename);
    return newData;
}

export function appendToDataSet2(toAdd: string[],
                                 appendTo: string,
                                 dataSets: DataSet[],
                                 ){
    const ds = dataSets.find(x => { return x.name == appendTo } )
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
}