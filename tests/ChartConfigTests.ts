import {annotationHelper, dateToAnnotation, BaseAnnotation, CustomChartOptions} from "../src/Chart";
import {touchstones} from "../src/Data";
import {expect} from "chai";

describe("ChartConfigs", () => {
  it("Check annotationHelper", () => {
    const conf: BaseAnnotation =
      annotationHelper("abc", 1066, "xyz");

    expect(conf.value).to.equal(1066);
    expect(conf.borderColor).to.equal("xyz");
    expect(conf.label.content).to.equal("abc");
    console.log(conf);
  })

  it("Check dateToAnnotation", () => {
    const annos: BaseAnnotation[] =
      dateToAnnotation(touchstones);

    const t = annos.map((a) => { return a.label.content; })
    // make sure the touchstones we get out the annotations
    // are the same as the ones we passed in.
    expect(t).to.eql(touchstones);
  })
});


//impactChartConfig
//timeSeriesChartConfig