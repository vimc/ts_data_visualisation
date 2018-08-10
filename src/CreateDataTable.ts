import * as ko from "knockout";

export class TableMaker {
    createTable(dataSets: any[], compareNames: string[]) : KnockoutObservableArray<any> {
        let returnData = ko.observableArray([]);
        for (let ds of dataSets) {
            const label = ds.label
            for (let i = 0; i < compareNames.length; ++i) {
                const compName = compareNames[i];
                const dataValue = ds.data[i];
                returnData.push({compare: compName, label: label, data: dataValue})
            }
        }
        return returnData;
    }

    createWideTable(dataSets: any[], compareNames: string[]) : KnockoutObservableArray<any> {
        let returnData = ko.observableArray([]);
        const disAggVars = dataSets.map(x => x['label'])
        for (let i = 0; i < compareNames.length; ++i) {
            let tempObject: any = {compare: compareNames[i]};
            for (let ds of dataSets) {
                tempObject[ds.label] =  ds.data[i];
            }
            returnData.push(tempObject);
        }
        return returnData;
    }
}