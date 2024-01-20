import { expect } from "chai";
import { Attribute, OCABox, create_nested_attr_type_from_js } from "oca.js";

describe("Attribute with condition is built", () => {
  try {
    const textTypeJs = create_nested_attr_type_from_js("Text");

    const attribute = new Attribute("name")
      .setAttributeType(textTypeJs)
      .setCondition("${age} > 18");

    it("check condition", () => {
      expect(attribute.checkCondition({ age: 20 })).to.be.true;
      expect(attribute.checkCondition({ age: 18 })).to.be.false;
    });
  } catch (error) {
    console.error("Error checking attribute condition", error);
  }
});
