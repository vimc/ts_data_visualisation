import * as ko from "knockout";

export class TableMaker {
    public createTable(dataSets: any[], compareNames: string[]): KnockoutObservableArray<any> {
        const returnData = ko.observableArray([]);
        for (const ds of dataSets) {
            const label = ds.label;
            for (let i = 0; i < compareNames.length; ++i) {
                const compName = compareNames[i];
                const dataValue = ds.data[i];
                returnData.push({compare: compName, label: label, data: dataValue});
            }
        }
        return returnData;
    }

    public createWideTable(dataSets: any[], compareNames: string[]): KnockoutObservableArray<any> {
        const returnData = ko.observableArray([]);
        const disAggVars = dataSets.map((x) => x["label"]);
        for (let i = 0; i < compareNames.length; ++i) {
            const tempObject: any = {compare: compareNames[i]};
            for (const ds of dataSets) {
                tempObject[ds.label] =  ds.data[i];
            }
            returnData.push(tempObject);
        }
        return returnData;
    }
}
