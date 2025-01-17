import { expect } from 'chai'
import { Attribute, OCABox, Encoding, create_nested_attr_type_from_js } from 'oca.js'

describe('Plain OCA is built', () => {
  const oca = new OCABox()
    .addClassification("GICS:35102020")
    .generateBundle()

  it('return OCA as JS object', () => {
    expect(oca).to.haveOwnProperty("d")
    expect(oca).to.haveOwnProperty("capture_base")
    expect(oca).to.have.nested.property("capture_base.type")
    expect(oca).to.have.nested.property("capture_base.d")
    expect(oca).to.have.nested.property("capture_base.classification")
    expect(oca).to.have.nested.property("capture_base.attributes")
    expect(oca).to.have.nested.property("capture_base.flagged_attributes")
    expect(oca).to.haveOwnProperty("overlays")

    expect(oca.capture_base.attributes).to.be.an('object').that.is.empty
    expect(oca.capture_base.classification).to.eq("GICS:35102020")
    expect(oca.capture_base.flagged_attributes).to.be.an('array').that.is.empty
  })
})

describe('OCA with attributes is built', () => {
    try {
        const numericTypeJs = create_nested_attr_type_from_js("Numeric");
        const dateTimeTypeJs = create_nested_attr_type_from_js("DateTime");
        const reference = "refs:EF5ERATRBBN_ewEo9buQbznirhBmvrSSC0O2GIR4Gbfs";
        const nestedAttrTypeJs = create_nested_attr_type_from_js(reference);
        const arrayTypeWithNumericJs = create_nested_attr_type_from_js(["Numeric"]);
        const arrayTypeWithRefJs = create_nested_attr_type_from_js(["refs:EF5ERATRBBN_ewEo9buQbznirhBmvrSSC0O2GIR4Gbfs"]);
        const arrayOfArrayTypeWithRefJs = create_nested_attr_type_from_js([["refs:EF5ERATRBBN_ewEo9buQbznirhBmvrSSC0O2GIR4Gbfs"]]);

        const oca = new OCABox()
        .addMeta("name", {
            eng: "Driving Licence",
            pol: "Prawo Jazdy"
        })
        .addMeta("description", {
            eng: "DL desc",
            pol: "PJ desc"
        })
        .addAttribute(
            new Attribute("attr_name")
            .setAttributeType(numericTypeJs)
            .setFlagged()
            .setLabel({
                eng: "Name: ",
                pol: "Imię: "
            })
            .setInformation({
                eng: "en info",
                pol: "pl info"
            })
            .setEntries({
                o1: {
                    eng: "option 1",
                    pol: "opcja 1"
                },
                o2: {
                    eng: "option 2",
                    pol: "opcja 2"
                }
            })
        )
        .addAttribute(
            new Attribute("attr2")
            .setAttributeType(dateTimeTypeJs)
            .setLabel({
                eng: "Date: ",
                pol: "Data: "
            })
            .setEncoding(Encoding.Iso8859_1)
            .setFormat("DD.MM.YYYY")
        )
        .addAttribute(
            new Attribute("attr3")
            .setAttributeType(nestedAttrTypeJs)
            .setLabel({
                eng: "Reference: ",
                pol: "Referecja: "
            })
        )
        .addAttribute(
            new Attribute("attr4")
            .setAttributeType(arrayTypeWithRefJs)
            .setLabel({
                eng: "Array: ",
                pol: "Tablica: "
            })
        )
        .addAttribute(
            new Attribute("attr5")
            .setAttributeType(arrayTypeWithNumericJs)
            .setLabel({
                eng: "Array: ",
                pol: "Tablica: "
            })
        )
        .addAttribute(
            new Attribute("attr6")
            .setAttributeType(arrayOfArrayTypeWithRefJs)
            .setLabel({
                eng: "Array: ",
                pol: "Tablica: "
            })
        )
        .generateBundle()
        describe("Capture Base", () => {
            const captureBase = oca.capture_base

            it('attributes properly added', () => {
                expect(captureBase.attributes).to.have.keys("attr_name", "attr2", "attr3", "attr4", "attr5", "attr6")
                expect(captureBase.attributes).to.have.property("attr_name", "Numeric")
                expect(captureBase.attributes).to.have.property("attr2", "DateTime")
                expect(captureBase.attributes).to.have.property("attr3", "refs:EF5ERATRBBN_ewEo9buQbznirhBmvrSSC0O2GIR4Gbfs")
                expect(captureBase.attributes).to.deep.property("attr4", ["refs:EF5ERATRBBN_ewEo9buQbznirhBmvrSSC0O2GIR4Gbfs"])
                expect(captureBase.attributes).to.deep.property("attr5", ["Numeric"])
                expect(captureBase.flagged_attributes).to.eql(["attr_name"])
            })
        })

        describe("Overlays", () => {
          const allOverlays = oca.overlays

          it('properly defined', () => {
            expect(Object.keys(oca.overlays).length).to.be.eq(7)
          })

          describe("Meta", () => {
            const overlays = allOverlays.meta

            it('properly defined', () => {
              const expected: {
                [lang: string]: { name: string, description: string }
              } = {
                pol: {
                  name: "Prawo Jazdy",
                  description: "PJ desc"
                },
                eng: {
                  name: "Driving Licence",
                  description: "DL desc"
                }
              }

              expect(overlays).to.be.lengthOf(Object.keys(expected).length)

              overlays.forEach(overlay => {
                const exp = expected[overlay.language]
                expect(exp).to.exist
                expect(overlay.name).to.be.eql(exp.name)
                expect(overlay.description).to.be.eql(exp.description)
              })
            })
          })

          describe("Character Encoding", () => {
            const overlay = allOverlays.character_encoding

            it('properly defined', () => {
              expect(overlay.attribute_character_encoding).to.have.keys("attr2")
              expect(overlay).to.have.nested.property("attribute_character_encoding.attr2", "iso-8859-1")
            })
          })

          describe("Format", () => {
            const overlay = allOverlays.format

            it('properly defined', () => {
              expect(overlay.attribute_formats).to.have.keys("attr2")
              expect(overlay).to.have.nested.property("attribute_formats.attr2", "DD.MM.YYYY")
            })
          })

          describe("Label", () => {
            const overlays = allOverlays.label

            it('properly defined', () => {
              const expected: {
                [lang: string]: { [attribute_name: string]: string }
              } = {
                pol: {
                  "attr_name": "Imię: ",
                  "attr2": "Data: ",
                  "attr3": "Referecja: ",
                  "attr4": "Tablica: ",
                  "attr5": "Tablica: ",
                  "attr6": "Tablica: "
                },
                eng: {
                  "attr_name": "Name: ",
                  "attr2": "Date: ",
                  "attr3": "Reference: ",
                  "attr4": "Array: ",
                  "attr5": "Array: ",
                  "attr6": "Array: "
                }
              }
              expect(overlays).to.lengthOf(2)

              overlays.forEach(overlay => {
                const exp = expected[overlay.language]
                expect(exp).to.exist
                expect(overlay.attribute_labels).to.have.keys(...Object.keys(exp))
                Object.entries(exp).forEach(([attr_name, label]) => {
                  expect(overlay.attribute_labels).to.have.property(attr_name, label)
                })
              })
            })
          })

          describe("Information", () => {
            const overlays = allOverlays.information

            it('properly defined', () => {
              const expected: {
                [lang: string]: { [attribute_name: string]: string }
              } = {
                pol: {
                  "attr_name": "pl info",
                },
                eng: {
                  "attr_name": "en info",
                }
              }
              expect(overlays).to.lengthOf(2)

              overlays.forEach(overlay => {
                const exp = expected[overlay.language]
                expect(exp).to.exist
                expect(overlay.attribute_information).to.have.keys("attr_name")
                expect(overlay.attribute_information).to.have.property("attr_name", exp["attr_name"])
              })
            })
          })

          describe("Entry Code", () => {
            const overlay = allOverlays.entry_code

            it('properly defined', () => {
              expect(overlay.attribute_entry_codes).to.have.keys("attr_name")
              expect(overlay).to.have.nested.property("attribute_entry_codes.attr_name").members(["o1", "o2"])
            })
          })

          describe("Entry", () => {
            const overlays = allOverlays.entry

            it('properly defined', () => {
              const expected: {
                [lang: string]: { [attribute_name: string]: { [entry_code: string]: string } }
              } = {
                pol: {
                  "attr_name": { "o1": "opcja 1", "o2": "opcja 2" },
                },
                eng: {
                  "attr_name": { "o1": "option 1", "o2": "option 2" },
                }
              }
              expect(overlays).to.lengthOf(2)

              overlays.forEach(overlay => {
                const exp = expected[overlay.language]
                expect(exp).to.exist
                expect(overlay.attribute_entries).to.have.keys("attr_name")
                expect(overlay.attribute_entries).to.have.property("attr_name")
                  .that.have.property("o1", exp["attr_name"]["o1"])
                expect(overlay.attribute_entries).to.have.property("attr_name")
                  .that.have.property("o2", exp["attr_name"]["o2"])
              })
            })
          })
        })
    } catch (error) {
        console.error("Error creating nested attr type from js", error);
    }
})
