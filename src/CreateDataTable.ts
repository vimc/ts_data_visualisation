import * as ko from "knockout";
import {FilteredRow} from "./FilteredRow";

interface BaseRow {
    compare: string;
}

export type TableRow = BaseRow & {
    label: string;
    data: number;
}

export type WideTableRow = BaseRow & {
    [prop: string]: number;
}

export class TableMaker {
    public createTable(dataSets: FilteredRow[], compareNames: string[]): KnockoutObservableArray<TableRow> {
        const returnData = ko.observableArray<TableRow>([]);
        for (const ds of dataSets) {
            const lbl = ds.label;
            for (let i = 0; i < compareNames.length; ++i) {
                const compName = compareNames[i];
                const dataValue = ds.data[i];
                returnData.push({compare: compName, label: lbl, data: dataValue});
            }
        }
        return returnData;
    }

    public createWideTable(dataSets: FilteredRow[], compareNames: string[]): KnockoutObservableArray<WideTableRow> {
        const returnData = ko.observableArray([]);
        const key = "label"; // this is a hack, eventually dataset needs an interface
        const disAggVars = dataSets.map((x) => x[key]);
        for (let i = 0; i < compareNames.length; ++i) {
            // there is probably a better way to this this!
            const tempObject: BaseRow = {compare: compareNames[i]};
            const row: WideTableRow = <WideTableRow>tempObject;
            for (const ds of dataSets) {
                row[ds.label] =  ds.data[i];
            }
            returnData.push(row);
        }
        return returnData;
    }
}
