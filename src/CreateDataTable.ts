/**
 * The code in this file converts the data from the an array of FilteredRows
 * to a (knockout) array of [Wide]TableRows which can easily be coerced into a
 * .csv file
 */
import * as ko from "knockout";
import {FilteredRow} from "./FilteredRow";

interface BaseRow {
  xaxis: string;
}

export type TableRow = BaseRow & {
  label: string;
  data: number;
};

export type WideTableRow = BaseRow & {
  [prop: string]: number;
};

export class TableMaker {
  /**
   * Wrangles an array of filtered rows into a an array of objects like
   * {xaxis: "India", label: "Rota", "data": 691}
   * This array will be coerced into a csv like
   *
   * xaxis,label,data
   * 2014,Rota,664
   * 2015,Rota,953
   * 2016,Rota,973
   * 2017,Rota,978
   * 2018,Rota,6350
   * 2014,Rubella,0
   * 2015,Rubella,0
   * 2016,Rubella,0
   * 2017,Rubella,20600
   * 2018,Rubella,23700
   *
   * @remarks This is not used at the moment, because the funders wanted the
   * csv table in a different format.
   * I left it in in case they change their mind.
   *
   * @param dataSets - The data to be coverted
   * @param compareNames - The values along the x axis (this could be inferred)
   *        from datasets, but it is a lot of work and we already have them.
   *
   * @returns The array of wrangled data
   */
  public createTable(dataSets: FilteredRow[], compareNames: string[]): ko.ObservableArray<TableRow> {
    const returnData = ko.observableArray<TableRow>([]);
    for (const ds of dataSets) {
      const lbl = ds.label;
      for (let i = 0; i < compareNames.length; ++i) {
        const compName = compareNames[i];
        const dataValue = ds.data[i];
        returnData.push({xaxis: compName, label: lbl, data: dataValue});
      }
    }
    return returnData;
  }

  /**
   * Wrangles an array of filtered rows into a an array of objects like
   * {xaxis: "India", label: "Rota", "data": 691}
   * This array will be coerced into a csv like
   *
   * xaxis,Rota,Rubella
   * 2014,664,0
   * 2015,953,0
   * 2016,973,0
   * 2017,978,20600
   * 2018,6350,23700
   *
   * @param dataSets - The data to be coverted
   * @param compareNames - The values along the x axis (this could be inferred)
   *        from datasets, but it is a lot of work and we already have them.
   *
   * @returns The array of wrangled data
   */
 public createWideTable(dataSets: FilteredRow[], compareNames: string[]): ko.ObservableArray<WideTableRow> {
    const returnData = ko.observableArray([]);
    const disAggVars = dataSets.map((x) => x.label);
    for (let i = 0; i < compareNames.length; ++i) {
      const row: WideTableRow = {xaxis: compareNames[i]} as WideTableRow;
      for (const ds of dataSets) {
        row[ds.label] =  ds.data[i];
      }
      returnData.push(row);
    }
    return returnData;
  }
}
