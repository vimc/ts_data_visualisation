import {TableMaker} from "../src/CreateDataTable";
import {expect} from "chai";

describe("TableMaker", () => {
  const names: string[] = ["Cat", "Dog"];
  const dataset: any[] =  [{"label" : "Alfa",    "data" : [1, 9]},
                           {"label" : "Bravo",   "data" : [2, 8]},
                           {"label" : "Charlie", "data" : [3, 7]},
                           {"label" : "Delta",   "data" : [4, 6]},
                           {"label" : "Echo",    "data" : [5, 5]}];

  it("createTable", () => {
    const tbl: TableMaker = new TableMaker();

    const out: any[] = tbl.createTable(dataset, names)();

    const expected: any[] = [ { compare: 'Cat', label: 'Alfa', data: 1 },
                              { compare: 'Dog', label: 'Alfa', data: 9 },
                              { compare: 'Cat', label: 'Bravo', data: 2 },
                              { compare: 'Dog', label: 'Bravo', data: 8 },
                              { compare: 'Cat', label: 'Charlie', data: 3 },
                              { compare: 'Dog', label: 'Charlie', data: 7 },
                              { compare: 'Cat', label: 'Delta', data: 4 },
                              { compare: 'Dog', label: 'Delta', data: 6 },
                              { compare: 'Cat', label: 'Echo', data: 5 },
                              { compare: 'Dog', label: 'Echo', data: 5 } ];

    expect(out).to.have.deep.members(expected);
  });

  it("createWideTable", () => {
    const tbl: TableMaker = new TableMaker();

    const out: any[] = tbl.createWideTable(dataset, names)();

    const expected: any[] = [ { compare: 'Cat', Alfa: 1, Bravo: 2, Charlie: 3, Delta: 4, Echo: 5 },
                              { compare: 'Dog', Alfa: 9, Bravo: 8, Charlie: 7, Delta: 6, Echo: 5 } ];

    expect(out).to.have.deep.members(expected);
  });
})