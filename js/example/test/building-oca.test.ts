import { expect } from 'chai'
import { buildFromOCAfile, bundleToJSON } from 'oca.js'
import fs from 'fs'

const overlay_file = fs.readFileSync('./test/assets/semantic.overlayfile', 'utf8')

describe('Plain OCA is built', () => {
  const ocafile = `--name=GICS-test
ADD Attribute attr_name=Numeric
`

  const oca = buildFromOCAfile(ocafile, overlay_file)

  it('return OCA as JS object', () => {
    const json = JSON.parse(JSON.parse(bundleToJSON(oca)))

    expect(json).to.haveOwnProperty("digest")
    expect(json).to.haveOwnProperty("capture_base")
    expect(json).to.have.nested.property("capture_base.type")
    expect(json).to.have.nested.property("capture_base.digest")
    expect(json).to.have.nested.property("capture_base.attributes")
    expect(json).to.haveOwnProperty("overlays")

    expect(json.capture_base.attributes).to.haveOwnProperty("attr_name")
  })
})

describe('OCA with attributes is built', () => {
  try {
    const ocafile = `--name=driving-licence
ADD Attribute attr_name=Numeric \
attr2=DateTime \
attr3=Text \
attr4=Text \
attr5=Numeric \
attr6=Text

ADD Overlay Meta
  language="en"
  name="Driving Licence"
  description="DL desc"

ADD Overlay Meta
  language="pl"
  name="Prawo Jazdy"
  description="PJ desc"

ADD OVERLAY Label
  language="en"
  attribute_labels
    attr_name="Name: "
    attr2="Date: "
    attr3="Reference: "
    attr4="Array: "
    attr5="Array: "
    attr6="Array: "

ADD OVERLAY label
  language="pl"
  attribute_labels
    attr_name="Imię: "
    attr2="Data: "
    attr3="Referecja: "
    attr4="Tablica: "
    attr5="Tablica: "
    attr6="Tablica: "

ADD OVERLAY ENTRY_CODE
  attribute_entry_codes
    attr_name=["o1", "o2"]

ADD OVERLAY ENTRY
  language="en"
  attribute_entries
    attr_name
      "o1"="option 1"
      "o2"="option 2"

ADD Overlay ENTRY
  language="pl"
  attribute_entries
    attr_name
      "o1"="opcja 1"
      "o2"="opcja 2"

ADD OVERLAY FORMAT
  attribute_formats
    attr2="DD.MM.YYYY"

ADD OVERLAY CHARACTER_ENCODING
  attribute_character_encodings
    attr2="iso-8859-1"
`

    const oca = buildFromOCAfile(ocafile, overlay_file)
    const json = JSON.parse(JSON.parse(bundleToJSON(oca)))

    describe("Capture Base", () => {
      const captureBase = json.capture_base

      it('attributes properly added', () => {
        expect(captureBase.attributes).to.have.keys("attr_name", "attr2", "attr3", "attr4", "attr5", "attr6")
        expect(captureBase.attributes).to.have.property("attr_name", "Numeric")
        expect(captureBase.attributes).to.have.property("attr2", "DateTime")
        expect(captureBase.attributes).to.have.property("attr3", "Text")
      })
    })

    describe("Overlays", () => {
      it('properly defined', () => {
        expect(json.overlays.length).to.be.greaterThan(0)
      })

      describe("Label", () => {
        const labelOverlays = json.overlays
          .filter((overlay: any) => overlay.type === 'overlay/label/2.0.0')

        it('properly defined', () => {
          expect(labelOverlays.length).to.eq(2)

          const expected: {
            [lang: string]: { [attribute_name: string]: string }
          } = {
            en: {
              "attr_name": "Name: ",
              "attr2": "Date: ",
              "attr3": "Reference: ",
              "attr4": "Array: ",
              "attr5": "Array: ",
              "attr6": "Array: "
            },
            pl: {
              "attr_name": "Imię: ",
              "attr2": "Data: ",
              "attr3": "Referecja: ",
              "attr4": "Tablica: ",
              "attr5": "Tablica: ",
              "attr6": "Tablica: "
            }
          }

          labelOverlays.forEach((overlay: any) => {
            const exp = expected[overlay.language]
            expect(exp).to.exist
            expect(overlay.attribute_labels).to.have.keys(...Object.keys(exp))
            Object.entries(exp).forEach(([attr_name, label]) => {
              expect(overlay.attribute_labels).to.have.property(attr_name, label)
            })
          })
        })
      })

      describe("Entry Code", () => {
        const entryCodeOverlay = json.overlays
          .find((overlay: any) => overlay.type === 'overlay/entry_code/2.0.0')

        it('properly defined', () => {
          expect(entryCodeOverlay).to.exist
          expect((entryCodeOverlay as any).attribute_entry_codes).to.have.keys("attr_name")
          expect((entryCodeOverlay as any).attribute_entry_codes.attr_name).to.have.members(["o1", "o2"])
        })
      })

      describe("Entry", () => {
        const entryOverlays = json.overlays
          .filter((overlay: any) => overlay.type === 'overlay/entry/2.0.0')

        it('properly defined', () => {
          const expected: {
            [lang: string]: { [attribute_name: string]: { [entry_code: string]: string } }
          } = {
            en: {
              "attr_name": { "o1": "option 1", "o2": "option 2" },
            },
            pl: {
              "attr_name": { "o1": "opcja 1", "o2": "opcja 2" },
            }
          }
          expect(entryOverlays.length).to.eq(2)

          entryOverlays.forEach((overlay: any) => {
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

      describe("Format", () => {
        const formatOverlay = json.overlays
          .find((overlay: any) => overlay.type === 'overlay/format/2.0.0')

        it('properly defined', () => {
          expect(formatOverlay).to.exist
          expect((formatOverlay as any).attribute_formats).to.have.keys("attr2")
          expect((formatOverlay as any).attribute_formats).to.have.property("attr2", "DD.MM.YYYY")
        })
      })

      describe("Character Encoding", () => {
        const charEncodingOverlay = json.overlays
          .find((overlay: any) => overlay.type === 'overlay/character_encoding/2.0.0')

        it('properly defined', () => {
          expect(charEncodingOverlay).to.exist
          expect((charEncodingOverlay as any).attribute_character_encodings).to.have.keys("attr2")
          expect((charEncodingOverlay as any).attribute_character_encodings).to.have.property("attr2", "iso-8859-1")
        })
      })
    })
  } catch (error) {
    console.error("Error creating OCA bundle", error);
  }
})
