import * as ut from "../src/Utils"
import * as sinon from "sinon";
import {appendToDataSet, DataSet, getDataSet} from "../src/AppendDataSets";
import {expect} from "chai";



describe("appendToDataSet", () => {

    it("Test appendToDataSet", () => {
      // mock here
      const stub = sinon.stub(ut, 'loadObjectFromJSONFile');
      stub.returns(
        [
          {"country":"FJI","country_name":"Fiji"},
          {"country":"GMB","country_name":"Gambia"},
          {"country":"GEO","country_name":"Georgia"},
          {"country":"GHA","country_name":"Ghana"},
          {"country":"GTM","country_name":"Guatemala"},
        ]
      );

      const ds: DataSet[] = [
        { name : "data_A", data : [], seen : [], prev: [] },
        { name : "data_B", data : [], seen : [], prev: [] },
        { name : "data_C", data : [], seen : [], prev: [] },
      ]

      appendToDataSet(["XXX"], "data_A", ds, false);
      expect(getDataSet("data_A", ds).data).to.have.length(5);

      appendToDataSet(["YYY"], "data_A", ds, false);
      expect(getDataSet("data_A", ds).data).to.have.length(10);

      appendToDataSet(["YYY"], "data_A", ds, false);
      expect(getDataSet("data_A", ds).data).to.have.length(10);
      expect(getDataSet("data_A", ds).seen).to.have.members(["XXX", "YYY"]);
      expect(getDataSet("data_A", ds).prev).to.have.members([]);

      appendToDataSet(["YYY"], "data_B", ds, true);
      expect(getDataSet("data_B", ds).data).to.have.length(5);
      expect(getDataSet("data_B", ds).seen).to.have.members(["YYY"]);
      expect(getDataSet("data_B", ds).prev).to.have.members(["YYY"]);


      expect(getDataSet("data_C", ds).data).to.have.length(0);
      expect(getDataSet("data_C", ds).seen).to.have.length(0);
      expect(getDataSet("data_C", ds).prev).to.have.length(0);


      // make sure we capture the console message
      let spy = sinon.spy(console, 'log');
      appendToDataSet(["ZZZ"], "data_D", ds, true);
      sinon.assert.calledWith(spy, "No dataset named data_D");
      expect(ds).to.have.length(3);
      
      spy.restore();
      stub.restore();
    })
});

