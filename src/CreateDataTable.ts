export class TableMaker {
    createTable(dataSets: any[], compareNames: string[]) : any[] {
        let returnData = [];
        for (let ds of dataSets) {
            const label = ds.label
            for (let i = 0; i < compareNames.length; ++i) {
                const compName = compareNames[i]
                const dataValue = ds.data[i]
                returnData.push({compare: compName, label: label, data: dataValue})
            }
        }
        return returnData;
    }
}