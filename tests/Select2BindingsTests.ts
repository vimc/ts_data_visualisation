import {expect} from "chai";
import {AllBindingsAccessor} from "../src/select2Binding";

describe("AllBindingsAccessor", () => {
  it("Check AllBindingsAccessor", () => {
    const binding: AllBindingsAccessor  = {
      get: (x: string) => 5,
      has: (x: string) => true
    };

    expect(binding.get).to.be.a("function");
    expect(binding.has).to.be.a("function");
    expect(binding.get("hello")).to.equal(5);
    expect(binding.has("world")).to.equal(true);
  })
})
